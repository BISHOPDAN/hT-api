import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { ChronicConditionService } from '../../services/patient/chronicCondition';

export const chronicConditionRoute = Router();

chronicConditionRoute.post('/', (req, res, next) => {
  new ChronicConditionService()
    .createChronicCondition(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

chronicConditionRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new ChronicConditionService()
    .updateChronicCondition(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


chronicConditionRoute.get('/:userid', (req, res, next) => {
    new ChronicConditionService()
      .getChronicCondition(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  chronicConditionRoute.delete('/:id', (req, res, next) => {
    new ChronicConditionService()
      .deleteChronicCondition(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
