import { Router } from 'express';
import { MentalAssessmentService } from '../../services/shared/mentalAssessmentService';
import { sendError, sendResponse } from '../../utils/response';

export const mentalAssessmentRoute = Router();

mentalAssessmentRoute.get('/questions', (req, res, next) => {
  new MentalAssessmentService()
    .getQuestions()
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

mentalAssessmentRoute.post('/questions', (req, res, next) => {
  new MentalAssessmentService()
    .addQuestion(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

mentalAssessmentRoute.get('/questions/:id', (req, res, next) => {
  new MentalAssessmentService()
    .getQuestion(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

mentalAssessmentRoute.delete('/questions/:id', (req, res, next) => {
  new MentalAssessmentService()
    .deleteQuestion(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
