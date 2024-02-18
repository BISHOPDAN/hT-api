import { IUser, User, validateProvider } from '../../models/user';
import { sign } from 'jsonwebtoken';
import { config } from '../../config/config';
import { createError, ErrorStatus } from '../../utils/response';
import { AuthToken, IAuthToken } from '../../models/authToken';
import moment from 'moment';
import { UserRole } from '../../models/enums/userRole';
import { PasswordService } from './passwordService';
import {
  capitalize,
  getUpdateOptions,
  isNameValid,
  isPasswordValid,
  isPhoneNumberValid,
} from '../../utils/utils';
import { UserSubscriptionService } from './userSubscriptionService';
import {
  AuthVerificationReason,
  AuthVerificationSource,
} from '../../models/enums/authVerificationReason';
import { EmailService } from './emailService';
import { EmailVerificationService } from './emailVerificationService';
import { EmailTemplateId } from '../../models/interfaces/emailTemplatePayload';
import { IEmailVerification } from '../../models/emailVerification';
import { ReferralService } from './referralService';
import { PractitionerType } from '../../models/enums/practitionerType';
import { AuthProvider } from '../../models/enums/generalEnum';
import { NotificationService } from './notificationService';
import {
  NotificationGroup,
  NotificationStrategy,
  NotificationTag,
} from '../../models/notification';

export class AuthService {
  public async checkAccountExists(body: {
    email: string;
  }): Promise<{ accountExists: boolean; email: string }> {
    const accountExists = !!(await AuthService.checkEmailInUse(body.email));
    return { accountExists, email: body.email };
  }

  public async register(
    deviceId: string,
    role: UserRole,
    body: IUser & { password?: string }
  ): Promise<{ user: IUser; token: string }> {
    if (!body.provider) throw createError('Provider is required', 400);
    if (!validateProvider(body.provider))
      throw createError(`Unsupported provider '${body.provider}'`, 400);
    if (body.provider === AuthProvider.AEGLE)
      return await AuthService.registerWithAegle(deviceId, role, body);
    else throw createError('Unsupported or no provider');
  }

  public async login(
    deviceId: string,
    role: UserRole,
    body: { email: string; password: string }
  ): Promise<{ user: IUser; token: string }> {
    if (!body.email) throw createError('Email is required', 400);
    if (!body.password) throw createError('Password is required', 400);
    let user: IUser = await User.findOne({ email: body.email })
      .lean<IUser>()
      .exec();
    if (!user) throw createError('Account not found', 400);
    if (user.suspended)
      throw createError('Account suspended. Please contact support', 400);
    if (!(await new PasswordService().checkPassword(user._id, body.password)))
      throw createError('Incorrect password', 400);
    if (!user.roles.includes(role))
      user = await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { roles: role } },
        { new: true }
      )
        .lean<IUser>()
        .exec();
    const token: string = await AuthService.addAuthToken(deviceId, role, user);
    return { user, token };
  }

  public async removeTokensForUser(user: string) {
    await AuthToken.deleteMany({ user }).exec();
  }

  private static async registerWithAegle(
    deviceId: string,
    role: UserRole,
    body: IUser & { password?: string; referralCode?: string }
  ): Promise<{ user: IUser; token: string }> {
    console.log('Registering: ', body);
    if (!body.firstName) throw createError('First name is required', 400);
    if (!body.lastName) throw createError('Last name is required', 400);
    if (!body.password) throw createError('Password is required', 400);
    if (!body.email && !body.phone)
      throw createError('Phone number or email is required', 400);
    if (!isNameValid(body.firstName))
      throw createError('Please provide a valid first name', 400);
    if (!isNameValid(body.lastName))
      throw createError('Please provide a valid last name', 400);
    if (!isPasswordValid(body.password))
      throw createError('Password should be 8 characters or more', 400);
    if (body.phone) {
      if (!isPhoneNumberValid(body.phone))
        throw createError('Invalid phone number', 400);
    }
    body.email = body.email.toLowerCase();
    body.firstName = capitalize(body.firstName);
    body.lastName = capitalize(body.lastName);
    body.practitionerTypes = body.practitionerTypes || [
      PractitionerType.DOCTOR,
    ];
    const existingUser: IUser = await this.checkEmailInUse(body.email);
    if (existingUser) {
      if (existingUser.roles.includes(role))
        throw createError('Email address already in use', 400);
      else
        throw createError(
          `Looks like you already have an Aegle account. Please login`,
          400,
          ErrorStatus.EXISTING_ACCOUNT
        );
    }
    body.roles = [role];
    let user: IUser = new User(body);
    await user.validate();
    console.log('>>> User validated: ', user);
    await new PasswordService().addPassword(user._id, body.password);
    console.log('>>> Password added');
    const authService = new AuthService();
    const token: string = await AuthService.addAuthToken(
      deviceId,
      role,
      user.toObject() as IUser
    );
    user = await user.save();
    await new UserSubscriptionService().assignFreeTrialSubscription(user._id);
    await new ReferralService().createReferralCodeForUser(user);
    await authService.requestEmailVerification({ email: user.email });
    if (body.referralCode)
      new ReferralService().applyReferralCode(user._id, body.referralCode);
    const notificationContent =
      'You have one day free trial on your Aegle app. Trial expires in 24 hours';
    if (role === UserRole.PATIENT) {
      new NotificationService().sendNotification(
        {
          userId: user._id.toString(),
          title: 'Welcome to Aegle',
          ticker: 'Welcome to Aegle',
          itemId: user._id.toString(),
          content: notificationContent,
          role: UserRole.PATIENT,
          tag: NotificationTag.ACCOUNT_STATUS,
          group: NotificationGroup.ACCOUNT_STATUS,
        },
        NotificationStrategy.PUSH_ONLY,
        false
      );
    }
    return { user, token };
  }

  public async requestEmailVerification(body: {
    email: string;
    resetLink?: string;
    source?: AuthVerificationSource;
  }): Promise<{ email: string }> {
    console.log('Requesting email verification: ', body);
    if (!body.email) throw createError('Email is required', 400);
    body.source = AuthVerificationSource.MOBILE;
    const email = body.email;
    const user: IUser = await User.findOne({ email }).lean<IUser>().exec();
    if (!user) throw createError('Account does not exist with us', 400);
    const emailVerification =
      await new EmailVerificationService().requestEmailVerification(
        email,
        AuthVerificationReason.USER_SIGN_UP,
        body.source
      );
    new EmailService().sendEmail(
      email,
      'Email verification',
      `Please use code '${emailVerification.code}' to verify your account on Aegle`,
      {
        templateId: EmailTemplateId.EMAIL_VERIFICATION_CODE,
        data: [
          {
            key: 'verification_code',
            value: emailVerification.code,
          },
        ],
      }
    );
    return { email };
  }

  public async requestPasswordReset(
    body: IUser & { source: AuthVerificationSource; resetLink?: string }
  ): Promise<{ email: string }> {
    console.log('Requesting password reset: ', body);
    if (!body.email) throw createError('Email is required', 400);
    body.source = body.source || AuthVerificationSource.MOBILE;
    const email = body.email;
    const user: IUser = await User.findOne({ email }).lean<IUser>().exec();
    if (!user) throw createError('Account does not exist with us', 400);
    const emailVerification =
      await new EmailVerificationService().requestEmailVerification(
        email,
        AuthVerificationReason.USER_PASSWORD_RESET,
        body.source
      );
    new EmailService().sendEmail(
      email,
      'Email verification',
      `Please use code '${emailVerification.code}' to verify your account on Aegle`,
      {
        templateId: EmailTemplateId.PASSWORD_RESET_CODE,
        data: [
          {
            key: 'verification_code',
            value: emailVerification.code,
          },
        ],
      }
    );
    return { email };
  }

  public async verifyEmail(
    body: any
  ): Promise<{ user: IUser; verificationCode: string }> {
    if (!body.reason) throw createError('Verification reason is required', 400);
    if (!body.verificationCode)
      throw createError('Verification code is required', 400);
    const reason: AuthVerificationReason = body.reason;
    const verificationCode = body.verificationCode;
    const emailVerificationService = new EmailVerificationService();
    const emailVerification: IEmailVerification =
      await emailVerificationService.getEmailVerification(
        reason,
        verificationCode,
        true
      );
    let user: IUser = await User.findOne({ email: emailVerification.email })
      .lean<IUser>()
      .exec();
    if (!user) throw createError('Account not found', 400);
    switch (reason) {
      case AuthVerificationReason.USER_SIGN_UP:
        user = await User.findByIdAndUpdate(
          user._id,
          { emailVerified: true },
          { new: true }
        )
          .lean<IUser>()
          .exec();
        await emailVerificationService.removeEmailVerification(
          emailVerification._id
        );
        break;
      case AuthVerificationReason.USER_PASSWORD_RESET:
        break;
    }
    return { user, verificationCode };
  }

  public async resetPassword(
    body,
    role: UserRole,
    deviceId: string
  ): Promise<{ user: IUser; token: string }> {
    console.log('Resetting password: ', body);
    if (!body.verificationCode)
      throw createError('Verification code is required', 400);
    if (!body.password) throw createError('Password is required', 400);
    const reason: AuthVerificationReason =
      AuthVerificationReason.USER_PASSWORD_RESET;
    const verificationCode = body.verificationCode;
    const emailVerificationService = new EmailVerificationService();
    const emailVerification: IEmailVerification =
      await emailVerificationService.getEmailVerification(
        reason,
        verificationCode
      );
    const user: IUser = await User.findOne({ email: emailVerification.email })
      .lean<IUser>()
      .exec();
    if (!user) throw createError('Account not found', 400);
    const userId = user._id;
    await new PasswordService().addPassword(userId, body.password, false);
    await this.removeTokensForUser(userId);
    return await this.login(deviceId, role, {
      email: user.email,
      password: body.password,
    } as any);
  }

  private static async googleAuth(body) {
    console.log('Google Auth: ', body);
  }

  public static async checkUsernameInUse(username: string): Promise<boolean> {
    const count = await User.countDocuments({ username }).exec();
    return count > 0;
  }

  public static async checkEmailInUse(email: string): Promise<IUser> {
    return await User.findOne({ email }).exec();
  }

  public static async addAuthToken(
    deviceId: string,
    role: UserRole,
    user: IUser
  ): Promise<string> {
    const token = sign(user, config.jwtSecret);
    const lastLogin = moment().toDate();
    const authToken: IAuthToken = await AuthToken.findOneAndUpdate(
      { user: user._id, role, deviceId },
      {
        deviceId,
        token,
        lastLogin,
      },
      getUpdateOptions()
    )
      .lean<IAuthToken>()
      .exec();
    return authToken.token;
  }

  public static async verifyToken(
    user: string,
    token: string
  ): Promise<IAuthToken> {
    return await AuthToken.findOne({ user, token }).lean<IAuthToken>().exec();
  }
}
