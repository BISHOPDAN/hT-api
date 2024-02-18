import { IUser, User } from '../../models/user';
import { createError } from '../../utils/response';
import { stripUpdateFields } from '../../utils/utils';
import { AuthService } from './authService';
import { PasswordService } from './passwordService';
import { AttachmentService } from './attachmentService';
import { AttachmentEntityModel } from '../../models/enums/attachmentEntityModel';
import { UserRole } from '../../models/enums/userRole';

export class ProfileService {
  public async getProfile(userId: string): Promise<IUser> {
    const user: IUser = await User.findById(userId).lean<IUser>().exec();
    if (!user) throw createError('User not found', 400);
    return user;
  }

  public async updateProfile(userId: string, body: IUser): Promise<IUser> {
    stripUpdateFields(body);
    return await User.findByIdAndUpdate(userId, body, { new: true })
      .lean<IUser>()
      .exec();
  }

  public async updatePassword(
    deviceId: string,
    userId: string,
    role: UserRole,
    body: { password: string; newPassword: string }
  ): Promise<{ user: IUser; token: string }> {
    if (!body.password) throw createError('Password is required');
    if (!body.newPassword) throw createError('New password is required');
    const authService = new AuthService();
    const passwordService = new PasswordService();
    const user: IUser = await this.getProfile(userId);
    if (!(await passwordService.checkPassword(userId, body.password)))
      throw createError('Incorrect password', 400);
    await authService.removeTokensForUser(userId);
    await passwordService.changePassword(userId, body.newPassword);
    return await authService.login(deviceId, role, {
      email: user.email,
      password: body.newPassword,
    });
  }

  public async uploadAvatar(userId: string, file: any): Promise<IUser> {
    if (!file) throw createError('File not attached', 400);
    await this.getProfile(userId);
    const attachmentService = new AttachmentService();
    const attachment = await attachmentService.uploadFile(
      file,
      true,
      userId,
      AttachmentEntityModel.USER
    );
    return await User.findByIdAndUpdate(
      userId,
      {
        profilePhotoThumbnailUrl: attachment.thumbnailUrl,
        profilePhotoUrl: attachment.url,
        profilePhotoAttachment: attachment,
      },
      { new: true }
    ).exec();
  }
}
