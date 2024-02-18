import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { BloodGlugoseService } from '../../services/patient/boodGlugose';

export const bloodGlugoseRoute = Router();

bloodGlugoseRoute.post('/', (req, res, next) => {
  new BloodGlugoseService()
    .createBloodGlugose(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

bloodGlugoseRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new BloodGlugoseService()
    .updateBloodGlugose(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


bloodGlugoseRoute.get('/:userid', (req, res, next) => {
    new BloodGlugoseService()
      .getBloodGlugose(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  bloodGlugoseRoute.delete('/:id', (req, res, next) => {
    new BloodGlugoseService()
      .deleteBloodGlugose(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
