import { Router } from 'express';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';
import { DocumentsService } from '../../services/doctors/documentsService';
import { upload } from '../../services/shared/uploadService';

export const documentsRoute = Router();

documentsRoute.post('/', upload.single('file'), (req, res, next) => {
  new DocumentsService()
    .uploadDocument(reqAsAny(req).query._userId, reqAsAny(req).file, req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

documentsRoute.get('/', (req, res, next) => {
  new DocumentsService()
    .getDocuments(reqAsAny(req).query._userId)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

documentsRoute.put('/:id/approve', (req, res, next) => {
  new DocumentsService()
    .verifyDocument(req.params.id)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

documentsRoute.put('/:id/reject', (req, res, next) => {
  new DocumentsService()
    .rejectDocument(reqAsAny(req).query._userId, req.body.reason)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
