import { Router } from 'express';

import { PaymentService } from '../../services/shared/paymentService';
import { sendError, sendResponse } from '../../utils/response';
import { reqAsAny } from '../../utils/utils';

export const externalPaymentsRoute = Router();

externalPaymentsRoute.get('/check_status', (req, res, next) => {
  console.log('>>> Checking payment as get: ', req.body);
  const body = req.body;
  const reference = body.data?.reference || reqAsAny(req).query.reference;
  console.log('>>> Validating reference: ', reference);
  new PaymentService()
    .checkStatus(reference)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

externalPaymentsRoute.post('/check_status', (req, res, next) => {
  console.log('>>> Checking payment as post: ', req.body);
  const body = req.body;
  const reference = body.data?.reference || reqAsAny(req).query.reference;
  console.log('>>> Validating reference: ', reference);
  new PaymentService()
    .checkStatus(reference)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
