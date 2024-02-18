import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { FitnessPlanService } from '../../services/shared/fitnessPlanService';
import { reqAsAny } from '../../utils/utils';
import { limitFilterForUser } from '../../utils/filterUtils';
import { FilterQuery } from 'mongoose';
import { IFitnessPlan } from '../../models/fitnessPlan';

export const fitnessPlansRoute = Router();

fitnessPlansRoute.get('/', (req, res, next) => {
  new FitnessPlanService()
    .find()
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessPlansRoute.get('/mine', (req, res, next) => {
  let filter: FilterQuery<IFitnessPlan> = limitFilterForUser(
    reqAsAny(req).query._user
  );
  if (reqAsAny(req).query.type) filter.type = reqAsAny(req).query.type;
  new FitnessPlanService()
    .findOne(filter, null, {
      validate: false,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessPlansRoute.get('/:id', (req, res, next) => {
  new FitnessPlanService()
    .findById(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessPlansRoute.patch('/:id', (req, res, next) => {
  new FitnessPlanService()
    .updateById(req.params.id, {
      $set: req.body,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessPlansRoute.delete('/:id', (req, res, next) => {
  new FitnessPlanService()
    .delete(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});
