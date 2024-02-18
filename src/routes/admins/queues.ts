import { Router } from 'express';
import { QueueService } from '../../services/shared/queueService';
import { sendError, sendResponse } from '../../utils/response';
import { QueueURL } from '../../models/enums/queue';

export const queuesRoute = Router();

queuesRoute.post('/', (req, res, next) => {
  new QueueService()
    .addToQueueAsync(QueueURL.FCM_QUEUE, req.body)
    .then((value) => {
      sendResponse(res, 200, value);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

queuesRoute.get('/', (req, res, next) => {
  new QueueService()
    .getMessagesInQueue(QueueURL.FCM_QUEUE)
    .then((value) => {
      sendResponse(res, 200, value);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
