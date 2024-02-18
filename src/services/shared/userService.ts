import { UserRole } from '../../models/enums/userRole';
import { IUser, User } from '../../models/user';
import { PractitionerType } from '../../models/enums/practitionerType';
import { createError } from '../../utils/response';
import { IDoctorStats } from '../admin/userService';

export class UserService {
  public async getUser(
    userId: string
  ): Promise<IUser & { stats?: IDoctorStats }> {
    const user: IUser & { stats?: IDoctorStats } = await User.findById(userId)
      .lean<IUser>()
      .exec();
    if (!user) throw createError('User not found', 404);
    return user;
  }

  public async getUsersByRole(role: UserRole): Promise<IUser[]> {
    return await User.find({ roles: { $in: role } })
      .lean<IUser[]>()
      .exec();
  }

  public async getDoctorsByPractitionerType(
    practitionerType: PractitionerType
  ): Promise<IUser[]> {
    return await User.find({
      roles: UserRole.DOCTOR,
      practitionerTypes: practitionerType,
    })
      .lean<IUser[]>()
      .exec();
  }

  public static setDefaultDoctorRoles() {
    User.updateMany(
      { roles: UserRole.DOCTOR, practitionerTypes: { $size: 0 } },
      {
        $set: {
          practitionerTypes: [PractitionerType.DOCTOR],
        },
      }
    )
      .exec()
      .then((result) => {
        console.log('>>> Default roles set', result);
      })
      .catch((err) => {
        console.error('>>> Default role set error: ', err);
      });
  }
}
