import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { DashboardService } from '../../services/admin/dashboardService';
import { AppointmentService } from '../../services/admin/appointmentService';

export const appointmentsRoute = Router();

appointmentsRoute.get('/', (req, res, next) => {
  new AppointmentService()
    .getAppointments(req)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.get('/stats', (req, res, next) => {
  new AppointmentService()
    .getStats(req)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.get('/:id', (req, res, next) => {
  new AppointmentService()
    .getAppointment(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
