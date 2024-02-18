import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { reqAsAny } from '../../utils/utils';
import { FitnessService } from '../../services/admin/fitnessService';

export const userFitnessRoute = Router();


userFitnessRoute.post('/', (req, res, next) => {
  new FitnessService()
    .createUserFit(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

userFitnessRoute.put('/:id', (req, res, next) => {
    new FitnessService()
      .updateUserFitness(req.params.id, req.body)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
  

