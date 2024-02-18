import { createError, createStatusCodeError } from '../../utils/response';
import { IUser } from '../../models/user';
import { verify } from 'jsonwebtoken';
import { AuthService } from '../../services/shared/authService';
import { UserTimezoneService } from '../../services/shared/userTimezoneService';
import { getUpdateOptions } from '../../utils/utils';

export const authenticator = async (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers.authorization;
  if (!token) return next(createError('Authorization field missing', 401));
  token = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
  const deviceId = req.query._deviceId;
  req.query._token = token;
  try {
    const role = req.query._role;
    const timezone = req.query._timezone;
    const user: IUser = (await verify(token, process.env.JWT_SECRET)) as IUser;
    if (!user) return next(createError('Authorization failed', 401));
    if (user.suspended)
      return next(createError('Authorization failed. Account suspended', 401));
    const authToken = await AuthService.verifyToken(user._id, token);
    console.log(
      `>>> Getting auth token. User: ${user._id}, role: ${role}, token: ${token}, device id: ${deviceId}`
    );
    if (!authToken) return next(createError('Authorization failed', 401));
    req.query._userId = authToken.user.toString();
    req.query._user = user;
    req.query._timezone = timezone;
    next();
  } catch (err) {
    next(createStatusCodeError(err, 401));
  }
};
