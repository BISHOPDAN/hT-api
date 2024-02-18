import { Router } from 'express';
import { sendError, sendResponse } from '../../utils/response';
import { PathologyService } from '../../services/patient/pathology';

export const pathologyRoute = Router();

pathologyRoute.post('/', (req, res, next) => {
  new PathologyService()
    .createPathology(req.body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

pathologyRoute.put('/:id', (req, res, next) => {
  const { params, body } = req;
  new PathologyService()
    .updatePathology(params.id, body)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});


pathologyRoute.get('/:userid', (req, res, next) => {
    new PathologyService()
      .getPathology(req.params.userid)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });

  pathologyRoute.delete('/:id', (req, res, next) => {
    new PathologyService()
      .deletePathology(req.params.id)
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  });
