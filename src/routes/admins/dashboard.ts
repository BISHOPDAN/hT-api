import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { DashboardService } from '../../services/admin/dashboardService';
import { reqAsAny } from '../../utils/utils';

export const dashboardRoute = Router();

dashboardRoute.get('/', (req, res, next) => {
  new DashboardService()
    .loadDashboard(
      reqAsAny(req).query.startDate,
      reqAsAny(req).query.endDate,
      reqAsAny(req).query.mapKey
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
