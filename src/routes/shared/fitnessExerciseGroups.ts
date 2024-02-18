import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { FitnessExerciseGroupService } from '../../services/shared/fitnessExerciseGroupService';
import { fileValidationHandler } from '../middlewares/fileValidator';
import { upload } from '../../services/shared/uploadService';

export const fitnessExerciseGroupsRoute = Router();

fitnessExerciseGroupsRoute.post(
  '/',
  upload.single('file'),
  fileValidationHandler.bind(fitnessExerciseGroupsRoute),
  (req, res, next) => {
    new FitnessExerciseGroupService()
      ._create(req.file, req.body)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);

fitnessExerciseGroupsRoute.get('/', (req, res, next) => {
  new FitnessExerciseGroupService()
    .find()
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessExerciseGroupsRoute.get('/:id', (req, res, next) => {
  new FitnessExerciseGroupService()
    .findById(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessExerciseGroupsRoute.patch('/:id', (req, res, next) => {
  new FitnessExerciseGroupService()
    .updateById(req.params.id, {
      $set: req.body,
    })
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});

fitnessExerciseGroupsRoute.delete('/:id', (req, res, next) => {
  new FitnessExerciseGroupService()
    .delete(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((error) => sendError(error, next));
});
