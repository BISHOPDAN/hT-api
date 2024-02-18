import { Router } from 'express';
import { AuthService } from '../../services/shared/authService';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';
import { EmailService } from '../../services/shared/emailService';
import { EmailTemplateId } from '../../models/interfaces/emailTemplatePayload';

export const authRoute = Router();

authRoute.post('/check_account', (req, res, next) => {
  new AuthService()
    .checkAccountExists(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

authRoute.post('/register', (req, res, next) => {
  new AuthService()
    .register(
      reqAsAny(req).query._deviceId,
      reqAsAny(req).query._role,
      req.body
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

authRoute.post('/login', (req, res, next) => {
  new AuthService()
    .login(reqAsAny(req).query._deviceId, reqAsAny(req).query._role, req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

authRoute.post('/request_email_verification', (req, res, next) => {
  new AuthService()
    .requestEmailVerification(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

authRoute.post('/verify_email', (req, res, next) => {
  new AuthService()
    .verifyEmail(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

authRoute.post('/request_reset_password', (req, res, next) => {
  new AuthService()
    .requestPasswordReset(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

authRoute.post('/reset_password', (req, res, next) => {
  new AuthService()
    .resetPassword(
      req.body,
      reqAsAny(req).query._role,
      reqAsAny(req).query._deviceId
    )
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

authRoute.post('/test_email', (req, res, next) => {
  new EmailService().sendEmail('yoozeey@gmail.com', 'Test', 'Test email', {
    templateId: EmailTemplateId.EMAIL_VERIFICATION_CODE,
    data: [
      {
        key: 'verification_code',
        value: '0987',
      },
    ],
  });
  sendResponse(res, 200, { message: 'Ok' });
});
