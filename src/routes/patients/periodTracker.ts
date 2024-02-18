import { Router } from 'express';
import { PeriodTrackerService } from '../../services/patient/periodTrackerService';
import { sendError, sendResponse } from '../../utils/response';

export const periodTrackerRoute = Router();

periodTrackerRoute.post('/', (req, res, next) => {
  new PeriodTrackerService()
    .createPeriodTracker(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

periodTrackerRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new PeriodTrackerService()
    .updatePeriodTracker(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


periodTrackerRoute.get('/posibleDates/:userid', (req, res, next) => {
    new PeriodTrackerService()
      .getNextPosibleVisitation(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
