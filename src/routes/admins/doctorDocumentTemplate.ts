import { Router } from 'express';
import { DoctorDocumentTemplateService } from '../../services/shared/doctorDocumentTemplateService';
import { sendError, sendResponse } from '../../utils/response';

export const doctorDocumentTemplateRoute = Router();

doctorDocumentTemplateRoute.post('/', (req, res, next) => {
  new DoctorDocumentTemplateService()
    .addDoctorDocumentTemplate(req.body)
    .then((result) => {
      sendResponse(res, 201, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

doctorDocumentTemplateRoute.get('/', (req, res, next) => {
  new DoctorDocumentTemplateService()
    .getDoctorTemplates()
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      console.error(err);
    });
});

doctorDocumentTemplateRoute.get('/:id', (req, res, next) => {
  new DoctorDocumentTemplateService()
    .getDoctorTemplate(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      console.error(err);
    });
});

doctorDocumentTemplateRoute.delete('/:id', (req, res, next) => {
  new DoctorDocumentTemplateService()
    .deleteDoctorTemplate(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      console.error(err);
    });
});
