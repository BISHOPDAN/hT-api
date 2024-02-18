import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { BloodPressureService } from '../../services/patient/bloodPressure';

export const bloodPressureRoute = Router();

bloodPressureRoute.post('/', (req, res, next) => {
  new BloodPressureService()
    .createBloodPressure(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

bloodPressureRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new BloodPressureService()
    .updateBloodPressure(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


bloodPressureRoute.get('/:userid', (req, res, next) => {
    new BloodPressureService()
      .getBloodPressure(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  bloodPressureRoute.delete('/:id', (req, res, next) => {
    new BloodPressureService()
      .deleteBloodPressure(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
