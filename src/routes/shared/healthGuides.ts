import { Router } from 'express';
import { healthGuideValidationHandler } from '../middlewares/payloadValidators';
import { HealthGuideService } from '../../services/shared/healthGuideService';
import { sendError, sendResponse } from '../../utils/response';
import { reqAsAny } from '../../utils/utils';
import { queryToFilter } from '../../utils/filterUtils';

export const healthGuidesRoute = Router();

healthGuidesRoute.post(
  '/',
  healthGuideValidationHandler.bind(healthGuidesRoute),
  (req, res, next) => {
    new HealthGuideService()
      .create(req.body)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);

healthGuidesRoute.get('/', (req, res, next) => {
  new HealthGuideService()
    .find(queryToFilter(req))
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

healthGuidesRoute.get('/templates', (req, res, next) => {
  new HealthGuideService()
    .getHealthGuideTemplates(reqAsAny(req).query.entity)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

healthGuidesRoute.get('/:id', (req, res, next) => {
  new HealthGuideService()
    .findById(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

healthGuidesRoute.patch('/:id', (req, res, next) => {
  new HealthGuideService()
    .updateById(req.params.id, {
      $set: req.body,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

healthGuidesRoute.delete('/:id', (req, res, next) => {
  new HealthGuideService()
    .delete(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});
