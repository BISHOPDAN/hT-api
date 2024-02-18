import { createError } from '../../utils/response';
import { normalizeEmail, normalizePhone } from '../../utils/utils';

export const routeGuard = async (req, res, next) => {
  req.query._deviceId = req.header('device-id');
  req.query._role = req.header('role');
  req.query._timezone = req.header('timezone');
  if (!req.query._deviceId)
    return next(createError('Device id is required', 400));
  if (!req.query._role) return next(createError('Role is required', 400));
  if (req.body.phone) req.body.phone = normalizePhone(req.body.phone);
  if (req.body.email) req.body.email = normalizeEmail(req.body.email);
  console.log(`Device id: ${req.query._deviceId}`);
  // console.log('Header: ', req.headers);
  next();
};
