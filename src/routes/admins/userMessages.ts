import { Router } from 'express';
import { UserMessageService } from '../../services/admin/userMessageService';
import { sendError, sendResponse } from '../../utils/response';
import { reqAsAny } from '../../utils/utils';

export const userMessagesRoute = Router();

userMessagesRoute.post('/', (req, res, next) => {
  new UserMessageService()
    .sendMessage(reqAsAny(req).query._userId, req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
userMessagesRoute.get('/', (req, res, next) => {
  new UserMessageService()
    .getUserMessages(req.query)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

userMessagesRoute.get('/:id', (req, res, next) => {
  new UserMessageService()
    .getUserMessages(req.query)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
