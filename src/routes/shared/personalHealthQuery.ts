import { Router } from 'express';
import { personalHealthQueryValidationHandler } from '../middlewares/payloadValidators';
import { sendError, sendResponse } from '../../utils/response';
import { PersonalHealthQueryService } from '../../services/shared/personHealthQueryService';
import { reqAsAny } from '../../utils/utils';
import { limitFilterForUser } from '../../utils/filterUtils';

export const personalHealthQueryRoute = Router();

personalHealthQueryRoute.post(
  '/',
  personalHealthQueryValidationHandler.bind(personalHealthQueryRoute),
  (req, res, next) => {
    new PersonalHealthQueryService()
      ._createWithUser(
        reqAsAny(req).query._userId,
        req.body,
        reqAsAny(req).query._timezone
      )
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);

personalHealthQueryRoute.get('/', (req, res, next) => {
  new PersonalHealthQueryService()
    .find(limitFilterForUser(reqAsAny(req).query._user))
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

personalHealthQueryRoute.get('/:id', (req, res, next) => {
  new PersonalHealthQueryService()
    .findById(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

personalHealthQueryRoute.patch('/:id', (req, res, next) => {
  new PersonalHealthQueryService()
    .updateById(req.params.id, {
      $set: req.body,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

personalHealthQueryRoute.delete('/:id', (req, res, next) => {
  new PersonalHealthQueryService()
    .delete(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});
