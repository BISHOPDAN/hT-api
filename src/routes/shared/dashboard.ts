import { Router } from 'express';
import { DashboardService } from '../../services/shared/dashboardService';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';

export const dashboardRoute = Router();

dashboardRoute.get('/', (req, res, next) => {
  new DashboardService()
    .loadDashboard(reqAsAny(req).query._role, reqAsAny(req).query._userId)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
