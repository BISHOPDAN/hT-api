import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { reqAsAny } from '../../utils/utils';
import { FitnessService } from '../../services/admin/fitnessService';

export const fitnessRoute = Router();

fitnessRoute.get('/', (req, res, next) => {
  new FitnessService()
    .getFitness()
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

fitnessRoute.post('/', (req, res, next) => {
  new FitnessService()
    .createFit(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

fitnessRoute.put('/:id', (req, res, next) => {
    new FitnessService()
      .updateFitness(req.params.id, req.body)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
  

fitnessRoute.get('/category', (req, res, next) => {
  new FitnessService()
    .getFitnessByCategory(reqAsAny(req).query.fitcategory)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

fitnessRoute.get('/package', (req, res, next) => {
    new FitnessService()
      .getFitnessByPackage(reqAsAny(req).query.fitpackage)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  fitnessRoute.get('/cat_package', (req, res, next) => {
    new FitnessService()
      .getFitnessByPackageCategory(reqAsAny(req).query.fitcategory,reqAsAny(req).query.fitpackage, )
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });


