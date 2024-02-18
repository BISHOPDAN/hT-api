import { Router } from 'express';

import { PaymentService } from '../../services/shared/paymentService';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';
import { authenticator } from '../middlewares/authenticator';

export const paymentsRoute = Router();

paymentsRoute.post('/init', authenticator, (req, res, next) => {
  new PaymentService()
    .initTransaction(reqAsAny(req).query._userId, req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

paymentsRoute.get('/check_status', (req, res, next) => {
  new PaymentService()
    .checkStatus(reqAsAny(req).query.reference)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
