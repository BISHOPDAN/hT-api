import { IUser, User } from '../../models/user';
import { FilterQuery } from 'mongoose';
import { buildPaginationOptions } from '../../utils/utils';
import { createError } from '../../utils/response';
import { UserRole } from '../../models/enums/userRole';
import { UserSubscriptionService } from '../shared/userSubscriptionService';
import { AuthService } from '../shared/authService';
import { AppointmentService } from '../shared/appointmentService';
import { AppointmentStatus } from '../../models/enums/appointmentStatus';
import { IDoctorDocument } from '../../models/doctorDocument';
import { DocumentsService } from '../doctors/documentsService';
import { DocumentVerificationStatus } from '../../models/enums/documentVerificationStatus';
import { NotificationService } from '../shared/notificationService';
import {
  NotificationGroup,
  NotificationImportance,
  NotificationTag,
} from '../../models/notification';

export class UserService {
  public async getUsers(req: any): Promise<IUser[]> {
    const filter: FilterQuery<IUser> = {};
    if (req.query.roles)
      Object.assign(filter, { roles: { $in: req.query.roles.split(',') } });
    if (req.query.searchQuery) {
      Object.assign(filter, {
        $or: [
          { firstName: { $regex: req.query.searchQuery, $options: 'i' } },
          { lastName: { $regex: req.query.searchQuery, $options: 'i' } },
          { email: { $regex: req.query.searchQuery, $options: 'i' } },
        ],
      });
    }
    const paginateOptions = buildPaginationOptions(
      filter,
      'createdAt',
      Object.assign(req, { sortAscending: false })
    );
    return await (User as any).paginate(paginateOptions);
  }

  public async getAllUserIds(): Promise<string[]> {
    return await User.find().distinct('_id').lean<string[]>().exec();
  }

  public async getUser(
    userId: string
  ): Promise<IUser & { stats?: IDoctorStats }> {
    const user: IUser & { stats?: IDoctorStats } = await User.findById(userId)
      .lean<IUser>()
      .exec();
    if (!user) throw createError('User not found', 404);
    if (user.roles.includes(UserRole.PATIENT)) {
      (user as any).subscription =
        await new UserSubscriptionService().getUserSubscription(userId, false);
    }
    if (user.roles.includes(UserRole.DOCTOR)) {
      user.stats = await this.getDoctorStats(userId);
    }
    return user;
  }

  private async getDoctorStats(user: string): Promise<IDoctorStats> {
    const appointmentService = new AppointmentService();
    const userObj = await User.findById(user).lean<IUser>().exec();
    const runningBookings = await appointmentService.countByStatus(
      user,
      userObj.practitionerTypes,
      AppointmentStatus.APPROVED,
      AppointmentStatus.STARTED
    );
    const completedBookings = await appointmentService.countByStatus(
      user,
      userObj.practitionerTypes,
      AppointmentStatus.COMPLETED
    );
    const totalBookings = await appointmentService.countByStatus(user);
    return { runningBookings, completedBookings, totalBookings };
  }

  public async enableOrDisableUser(userId: string, suspended): Promise<IUser> {
    await User.findByIdAndUpdate(userId, { suspended }).exec();
    const user = await this.getUser(userId);
    if (user.suspended) await new AuthService().removeTokensForUser(userId);
    return user;
  }

  public async makeUserAdmin(userId: string): Promise<IUser> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { roles: UserRole.ADMIN },
    }).exec();
    return await this.getUser(userId);
  }

  public async removeUserFromAdmin(userId: string): Promise<IUser> {
    await User.findByIdAndUpdate(userId, {
      $pull: { roles: UserRole.ADMIN },
    }).exec();
    return await this.getUser(userId);
  }

  public async verifyDoctorAccount(userId: string, req: any): Promise<IUser> {
    const force: boolean = req.query.force === 'true';
    const documents: IDoctorDocument[] =
      await new DocumentsService().getDocuments(userId);
    const unverifiedDocumentsCount: number = documents.filter(
      (value) =>
        value.verificationStatus !== DocumentVerificationStatus.VERIFIED
    ).length;
    if (unverifiedDocumentsCount > 0 && !force) {
      throw createError(
        `Account cannot be verified. ${unverifiedDocumentsCount} unverified document(s) for this doctor. Use the 'force' query parameter to force this verification`
      );
    }
    const user = await User.findByIdAndUpdate(userId, {
      $set: {
        doctorProfileVerified: true,
      },
      $unset: {
        doctorProfileUnverifiedReason: 1,
      },
    }).exec();
    if (user) {
      new NotificationService().sendNotification({
        userId: userId,
        role: UserRole.DOCTOR,
        title: 'Account Verified',
        ticker: 'Account Verified',
        content:
          'Your account has been verified. You can now start accepting consultations',
        tag: NotificationTag.ACCOUNT_STATUS,
        group: NotificationGroup.ACCOUNT_STATUS,
        importance: NotificationImportance.HIGH,
      });
    }
    return await this.getUser(userId);
  }

  public async unVerifyDoctorAccount(
    userId: string,
    reason: string
  ): Promise<IUser> {
    await User.findByIdAndUpdate(userId, {
      $set: {
        doctorProfileVerified: false,
        doctorProfileUnverifiedReason: reason,
      },
    }).exec();
    return await this.getUser(userId);
  }
}

export interface IDoctorStats {
  totalBookings: number;
  runningBookings: number;
  completedBookings: number;
}
