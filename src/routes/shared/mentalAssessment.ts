import { Router } from 'express';
import { MentalAssessmentService } from '../../services/shared/mentalAssessmentService';
import { sendError, sendResponse } from '../../utils/response';
import { reqAsAny } from '../../utils/utils';

export const mentalAssessmentRoute = Router();

mentalAssessmentRoute.post('', (req, res, next) => {
  new MentalAssessmentService()
    .submitAssessment(reqAsAny(req).query._userId, req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

mentalAssessmentRoute.get('', (req, res, next) => {
  new MentalAssessmentService()
    .getAssessment(reqAsAny(req).query._userId)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

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
