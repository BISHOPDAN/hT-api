import { Router } from 'express';
import { SubscriptionService } from '../../services/shared/subscriptionService';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';
import { UserSubscriptionService } from '../../services/shared/userSubscriptionService';

export const subscriptionsRoute = Router();

subscriptionsRoute.get('/', (req, res, next) => {
  new UserSubscriptionService()
    .getUserSubscription(reqAsAny(req).query._userId, false)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

subscriptionsRoute.get('/plans', (req, res, next) => {
  new SubscriptionService()
    .getSubscriptionsPlans(reqAsAny(req).query.group)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

subscriptionsRoute.post('/plans/:id/get', (req, res, next) => {
  new SubscriptionService()
    .payForSubscription(reqAsAny(req).query._userId, req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
