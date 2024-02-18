import { Router } from 'express';
import { PeriodTrackerService } from '../../services/patient/periodTrackerService';
import { sendError, sendResponse } from '../../utils/response';
import { QuestionService } from '../../services/admin/questionService';

export const questionRoute = Router();

questionRoute.post('/', (req, res, next) => {
  new QuestionService()
    .createQuestion(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

questionRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new QuestionService()
    .updateQuestions(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


questionRoute.get('/:questintype', (req, res, next) => {
    new QuestionService()
      .getQuestion(req.params.questintype)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
