import { Router } from 'express';
import { NotificationService } from '../../services/shared/notificationService';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';

export const notificationsRoute = Router();

notificationsRoute.post('/', (req, res, next) => {
  new NotificationService()
    .sendNotificationAsync(req.body)
    .then((result) => {
      sendResponse(res, 204, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

notificationsRoute.get('/', (req, res, next) => {
  new NotificationService()
    .getNotifications(reqAsAny(req).query._userId, reqAsAny(req).query._role)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

notificationsRoute.post('/fcmToken', (req, res, next) => {
  new NotificationService()
    .saveFcmToken(
      reqAsAny(req).query._userId,
      reqAsAny(req).query._role,
      reqAsAny(req).query._deviceId,
      req.body.fcmToken
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
