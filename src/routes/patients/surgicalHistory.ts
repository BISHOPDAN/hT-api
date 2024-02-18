import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { SurgicalHistorySeervice } from '../../services/patient/surgicalHistory';

export const surgicalHistoryRoute = Router();

surgicalHistoryRoute.post('/', (req, res, next) => {
  new SurgicalHistorySeervice()
    .createBloodTest(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

surgicalHistoryRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new SurgicalHistorySeervice()
    .updateSurgicalHistory(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


surgicalHistoryRoute.get('/:userid', (req, res, next) => {
    new SurgicalHistorySeervice()
      .getSurgicalHistory(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  surgicalHistoryRoute.delete('/:id', (req, res, next) => {
    new SurgicalHistorySeervice()
      .deleteSurgicalHistory(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
