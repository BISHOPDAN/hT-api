import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { SubscriptionService } from '../../services/admin/subscriptionService';
import { UserSubscriptionService } from '../../services/admin/userSubscriptionService';

export const subscriptionsRoute = Router();

subscriptionsRoute.get('/', (req, res, next) => {
  new SubscriptionService()
    .getSubscriptions(req)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

subscriptionsRoute.get('/user-subscriptions', (req, res, next) => {
  new UserSubscriptionService()
    .getUserSubscriptions(req.query as any)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

subscriptionsRoute.post('/', (req, res, next) => {
  new SubscriptionService()
    .createSubscription(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

subscriptionsRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new SubscriptionService()
    .updateSubscription(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

subscriptionsRoute.delete('/:id', (req, res, next) => {
  const { params, body } = req;
  new SubscriptionService()
    .deleteSubscription(params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

subscriptionsRoute.put('/:id/assign', (req, res, next) => {
  const { params, body } = req;
  new SubscriptionService()
    .assignSubscription(body.user, params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
