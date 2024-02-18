import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { BroadcastMessageService } from '../../services/admin/broadcastMessageService';

export const broadcastMessagesRoute = Router();

broadcastMessagesRoute.get('/', (req, res, next) => {
  new BroadcastMessageService()
    .getBroadcastMessages(req)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

broadcastMessagesRoute.post('/', (req, res, next) => {
  new BroadcastMessageService()
    .sendBroadcastMessage(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
