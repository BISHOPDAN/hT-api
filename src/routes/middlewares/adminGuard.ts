import { createError } from '../../utils/response';
import { IUser } from '../../models/user';
import { UserRole } from '../../models/enums/userRole';

export const adminGuard = async (req, res, next) => {
  try {
    const user: IUser = req.query._user;
    if (!user || !user.roles.includes(UserRole.ADMIN))
      return next(createError('Not authorized to access this resource', 400));
    next();
  } catch (e) {
    next(e);
  }
};
