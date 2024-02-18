import { Router } from 'express';
import { UserService } from '../../services/admin/userService';
import { sendError, sendResponse } from '../../utils/response';

export const usersRoute = Router();

usersRoute.get('/', (req, res, next) => {
  new UserService()
    .getUsers(req)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

usersRoute.get('/:id', (req, res, next) => {
  new UserService()
    .getUser(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

usersRoute.put('/:id/enable', (req, res, next) => {
  new UserService()
    .enableOrDisableUser(req.params.id, false)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

usersRoute.put('/:id/disable', (req, res, next) => {
  new UserService()
    .enableOrDisableUser(req.params.id, true)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

usersRoute.put('/:id/admin', (req, res, next) => {
  new UserService()
    .makeUserAdmin(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

usersRoute.delete('/:id/admin', (req, res, next) => {
  new UserService()
    .removeUserFromAdmin(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

usersRoute.put('/:id/approve_doctor_account', (req, res, next) => {
  new UserService()
    .verifyDoctorAccount(req.params.id, req)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

usersRoute.put('/:id/reject_doctor_account', (req, res, next) => {
  new UserService()
    .unVerifyDoctorAccount(req.params.id, req.body.reason)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
