import { Router } from 'express';
import { UserService } from '../../services/admin/userService';
import { sendError, sendResponse } from '../../utils/response';
import { ReferralService } from '../../services/admin/referralService';
import { usersRoute } from './users';
import { reqAsAny } from '../../utils/utils';

export const referralsRoute = Router();

referralsRoute.get('/', (req, res, next) => {
  new ReferralService()
    .getReferrals(req)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

referralsRoute.post('/', (req, res, next) => {
  new ReferralService()
    .createReferral(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

usersRoute.get('/referee', (req, res, next) => {
  new ReferralService()
    .getUserReferee(reqAsAny(req).query.user_id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

referralsRoute.get('/:id', (req, res, next) => {
  new ReferralService()
    .getReferral(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

referralsRoute.put('/:id', (req, res, next) => {
  new ReferralService()
    .updateReferral(req.params.id, req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

referralsRoute.delete('/:id', (req, res, next) => {
  new ReferralService()
    .deleteReferral(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
