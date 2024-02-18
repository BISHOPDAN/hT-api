import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { fileValidationHandler } from '../middlewares/fileValidator';
import { upload } from '../../services/shared/uploadService';
import { FitnessExercisesService } from '../../services/shared/fitnessExercisesService';
import { queryToFilter } from '../../utils/filterUtils';

export const fitnessExercisesRoute = Router();

fitnessExercisesRoute.post(
  '/',
  upload.single('file'),
  fileValidationHandler.bind(fitnessExercisesRoute),
  (req, res, next) => {
    new FitnessExercisesService()
      ._create(req.file, req.body)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);

fitnessExercisesRoute.get('/', (req, res, next) => {
  new FitnessExercisesService()
    .find(queryToFilter(req))
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessExercisesRoute.get('/:id', (req, res, next) => {
  new FitnessExercisesService()
    .findById(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessExercisesRoute.patch('/:id', (req, res, next) => {
  new FitnessExercisesService()
    .updateById(req.params.id, {
      $set: req.body,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessExercisesRoute.delete('/:id', (req, res, next) => {
  new FitnessExercisesService()
    .delete(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessExercisesRoute.put(
  '/:id/attachments',
  upload.single('file'),
  fileValidationHandler.bind(fitnessExercisesRoute),
  (req, res, next) => {
    new FitnessExercisesService()
      .addAttachments(req.params.id, req.file)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);
