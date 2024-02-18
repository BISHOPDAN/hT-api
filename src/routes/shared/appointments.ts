import { Router } from 'express';
import { AppointmentService } from '../../services/shared/appointmentService';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';
import { userRoleGuard } from '../middlewares/userRoleGuard';
import { doctorRoleGuard } from '../middlewares/doctorRoleGuard';

export const appointmentsRoute = Router();

appointmentsRoute.post('/', userRoleGuard, (req, res, next) => {
  new AppointmentService()
    .requestAppointment(
      reqAsAny(req).query._userId,
      req.body,
      reqAsAny(req).query._timezone
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.get('/', (req, res, next) => {
  new AppointmentService()
    .getAppointments(
      reqAsAny(req).query._userId,
      reqAsAny(req).query._role,
      reqAsAny(req).query.limit,
      reqAsAny(req).query.status,
      reqAsAny(req).query.startDate,
      reqAsAny(req).query.endDate
    )
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

appointmentsRoute.post('/:id/reschedule', doctorRoleGuard, (req, res, next) => {
  new AppointmentService()
    .rescheduleAppointment(
      reqAsAny(req).query._userId,
      req.params.id,
      req.body,
      reqAsAny(req).query._timezone
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.post('/:id/approve', doctorRoleGuard, (req, res, next) => {
  new AppointmentService()
    .approveAppointment(reqAsAny(req).query._userId, req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.post('/:id/start', doctorRoleGuard, (req, res, next) => {
  new AppointmentService()
    .startAppointment(reqAsAny(req).query._userId, req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.post('/:id/complete', (req, res, next) => {
  new AppointmentService()
    .completeAppointment(
      reqAsAny(req).query._userId,
      reqAsAny(req).query._role,
      req.params.id,
      req.body.reason
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.post('/:id/doctor_notes', (req, res, next) => {
  new AppointmentService()
    .addDoctorNote(req.params.id, req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.post('/:id/init_video', (req, res, next) => {
  new AppointmentService()
    .initializeVideo(
      reqAsAny(req).query._userId,
      reqAsAny(req).query._role,
      req.params.id
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

appointmentsRoute.post('/:id/join', (req, res, next) => {
  new AppointmentService()
    .joinAppointment(
      reqAsAny(req).query._userId,
      reqAsAny(req).query._role,
      req.params.id
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
