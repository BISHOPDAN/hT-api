import { Router } from 'express';
import {
  healthChoiceMultiValidationHandler,
  healthChoiceValidationHandler,
} from '../middlewares/payloadValidators';
import { HealthChoiceService } from '../../services/shared/healthChoiceService';
import { sendError, sendResponse } from '../../utils/response';
import { queryToFilter } from '../../utils/filterUtils';

export const healthChoicesRoute = Router();

healthChoicesRoute.post(
  '/',
  healthChoiceValidationHandler.bind(healthChoicesRoute),
  (req, res, next) => {
    new HealthChoiceService()
      .create(req.body)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);

healthChoicesRoute.post(
  '/multi',
  healthChoiceMultiValidationHandler.bind(healthChoicesRoute),
  (req, res, next) => {
    new HealthChoiceService()
      .createMulti(req.body)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);

healthChoicesRoute.get('/', (req, res, next) => {
  new HealthChoiceService()
    .find(queryToFilter(req))
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

healthChoicesRoute.get('/:id', (req, res, next) => {
  new HealthChoiceService()
    .findById(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

healthChoicesRoute.patch('/:id', (req, res, next) => {
  new HealthChoiceService()
    .updateById(req.params.id, {
      $set: req.body,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

healthChoicesRoute.delete('/:id', (req, res, next) => {
  new HealthChoiceService()
    .delete(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});
