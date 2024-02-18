import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { AllergyService } from '../../services/patient/allergy';

export const allergyRoute = Router();

allergyRoute.post('/', (req, res, next) => {
  new AllergyService()
    .createAllergy(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

allergyRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new AllergyService()
    .updateAllergy(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


allergyRoute.get('/:userid', (req, res, next) => {
    new AllergyService()
      .getAllergy(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  allergyRoute.delete('/:id', (req, res, next) => {
    new AllergyService()
      .deleteAllergy(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
