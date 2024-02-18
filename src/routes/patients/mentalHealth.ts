import { Router } from 'express';
import { PeriodTrackerService } from '../../services/patient/periodTrackerService';
import { sendError, sendResponse } from '../../utils/response';
import { MentalHealthAssessmentService } from '../../services/patient/mentalHealthAssessmentService';

export const mentalHealthRoute = Router();

mentalHealthRoute.post('/', (req, res, next) => {
  new MentalHealthAssessmentService()
    .createMentalHealthAssessment(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


mentalHealthRoute.get('/:userid', (req, res, next) => {
    new MentalHealthAssessmentService()
      .getResponse(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
