import { Router } from 'express';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';
import { ChatService } from '../../services/shared/chatService';
import { upload } from '../../services/shared/uploadService';

export const chatMessagesRoute = Router();

chatMessagesRoute.post('/', (req, res, next) => {
  new ChatService()
    .sendChatMessage(
      reqAsAny(req).query._userId,
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

chatMessagesRoute.post(
  '/with_attachment',
  upload.single('file'),
  (req, res, next) => {
    new ChatService()
      .sendChatMessageWithAttachment(
        reqAsAny(req).query._userId,
        reqAsAny(req).query._role,
        reqAsAny(req).file,
        req.body
      )
      .then((result) => {
        sendResponse(res, 200, result);
      })
      .catch((err) => {
        sendError(err, next);
      });
  }
);

chatMessagesRoute.get('/', (req, res, next) => {
  new ChatService()
    .getChatHeads(reqAsAny(req).query._userId)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});

chatMessagesRoute.get('/conversations', (req, res, next) => {
  const grouped: boolean = reqAsAny(req).query.grouped;
  const chatService = new ChatService();
  const resultPromise = grouped
    ? chatService.getGroupedChatMessages(
        reqAsAny(req).query._userId,
        reqAsAny(req).query.participant
      )
    : chatService.getChatMessages(
        reqAsAny(req).query._userId,
        reqAsAny(req).query.appointment,
        reqAsAny(req).query.conversationId,
        reqAsAny(req).query.participant
      );
  resultPromise
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
