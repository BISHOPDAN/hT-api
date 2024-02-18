import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { BloodTestService } from '../../services/patient/bloodTest';

export const bloodTestRoute = Router();

bloodTestRoute.post('/', (req, res, next) => {
  new BloodTestService()
    .createBloodTest(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

bloodTestRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new BloodTestService()
    .updateBloodTest(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


bloodTestRoute.get('/:userid', (req, res, next) => {
    new BloodTestService()
      .getBloodTest(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  bloodTestRoute.delete('/:id', (req, res, next) => {
    new BloodTestService()
      .deleteBloodTest(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
