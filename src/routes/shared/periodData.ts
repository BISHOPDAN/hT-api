import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { PeriodDataService } from '../../services/shared/periodDataService';
import { limitFilterForUser } from '../../utils/filterUtils';
import { reqAsAny } from '../../utils/utils';

export const periodDataRoute = Router();

periodDataRoute.post('/', (req, res, next) => {
  new PeriodDataService()
    ._create(
      reqAsAny(req).query._userId,
      req.body.responses,
      reqAsAny(req).query._timezone
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

periodDataRoute.get('/', (req, res, next) => {
  new PeriodDataService()
    .find(limitFilterForUser(reqAsAny(req).query._user), null, {
      sort: { date: 'asc' },
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

periodDataRoute.post('/dates', (req, res, next) => {
  new PeriodDataService()
    .updatePeriodDates(
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
});

periodDataRoute.get('/:id', (req, res, next) => {
  new PeriodDataService()
    .findById(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

periodDataRoute.patch('/:id', (req, res, next) => {
  new PeriodDataService()
    .updateById(req.params.id, {
      $set: req.body,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

periodDataRoute.delete('/:id', (req, res, next) => {
  new PeriodDataService()
    .delete(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});
