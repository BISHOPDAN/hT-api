import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { RadiologyService } from '../../services/patient/radiology';

export const radiologyRoute = Router();

radiologyRoute.post('/', (req, res, next) => {
  new RadiologyService()
    .createRadiology(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

radiologyRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new RadiologyService()
    .updateRadiology(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


radiologyRoute.get('/:userid', (req, res, next) => {
    new RadiologyService()
      .getRadiology(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  radiologyRoute.delete('/:id', (req, res, next) => {
    new RadiologyService()
      .deleteRadiology(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
