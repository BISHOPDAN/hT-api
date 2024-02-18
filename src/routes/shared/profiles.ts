import { Router } from 'express';
import { ProfileService } from '../../services/shared/profileService';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';
import { upload } from '../../services/shared/uploadService';

export const profilesRoute = Router();

profilesRoute.get('/', (req, res, next) => {
  new ProfileService()
    .getProfile(reqAsAny(req).query._userId)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

profilesRoute.put('/', (req, res, next) => {
  new ProfileService()
    .updateProfile(reqAsAny(req).query._userId, req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

profilesRoute.put('/password', (req, res, next) => {
  new ProfileService()
    .updatePassword(
      reqAsAny(req).query._deviceId,
      reqAsAny(req).query._userId,
      reqAsAny(req).query._role,
      req.body
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

profilesRoute.put('/avatar', upload.single('file'), (req, res, next) => {
  new ProfileService()
    .uploadAvatar(reqAsAny(req).query._userId, reqAsAny(req).file)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
