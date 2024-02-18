import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { fileValidationHandler } from '../middlewares/fileValidator';
import { upload } from '../../services/shared/uploadService';
import { NutritionGuidesService } from '../../services/shared/nutritionGuidesService';
import { queryToFilter } from '../../utils/filterUtils';

export const nutritionGuidesRoute = Router();

nutritionGuidesRoute.post(
  '/',
  upload.single('file'),
  fileValidationHandler.bind(nutritionGuidesRoute),
  (req, res, next) => {
    new NutritionGuidesService()
      ._create(req.file, req.body)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);

nutritionGuidesRoute.get('/', (req, res, next) => {
  new NutritionGuidesService()
    .find(queryToFilter(req))
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

nutritionGuidesRoute.get('/:id', (req, res, next) => {
  new NutritionGuidesService()
    .findById(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

nutritionGuidesRoute.patch('/:id', (req, res, next) => {
  new NutritionGuidesService()
    .updateById(req.params.id, {
      $set: req.body,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

nutritionGuidesRoute.delete('/:id', (req, res, next) => {
  new NutritionGuidesService()
    .delete(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

nutritionGuidesRoute.put(
  '/:id/attachments',
  upload.single('file'),
  fileValidationHandler.bind(nutritionGuidesRoute),
  (req, res, next) => {
    new NutritionGuidesService()
      .addAttachments(req.params.id, req.file)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);
