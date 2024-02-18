import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { CurrentMedService } from '../../services/patient/currentMed';

export const currentMedRoute = Router();

currentMedRoute.post('/', (req, res, next) => {
  new CurrentMedService()
    .createCurrentMed(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

currentMedRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new CurrentMedService()
    .updateCurrentMed(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


currentMedRoute.get('/:userid', (req, res, next) => {
    new CurrentMedService()
      .getCurrentMed(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  currentMedRoute.delete('/:id', (req, res, next) => {
    new CurrentMedService()
      .deleteCurrentMed(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
