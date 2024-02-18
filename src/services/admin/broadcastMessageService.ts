import {
  BroadcastMessage,
  IBroadcastMessage,
} from '../../models/broadcastMessage';
import { createError } from '../../utils/response';
import { NotificationService } from '../shared/notificationService';
import {
  NotificationGroup,
  NotificationImportance,
  NotificationStrategy,
  NotificationTag,
} from '../../models/notification';

export class BroadcastMessageService {
  public async sendBroadcastMessage(
    body: IBroadcastMessage & { topic?: string; users?: string[] }
  ): Promise<IBroadcastMessage> {
    if (!body.message) throw createError('Message is required', 400);
    const messagingResult = await NotificationService.sendBroadcast({
      title: body.title || 'From Aegle',
      content: body.message,
      tag: NotificationTag.BROADCAST_MESSAGE,
      group: NotificationGroup.BROADCAST_MESSAGE,
      importance: NotificationImportance.HIGH,
      strategy: NotificationStrategy.PUSH_ONLY,
      role: body.role,
      topic: body.topic,
    });
    return (
      await new BroadcastMessage({
        role: body.role,
        title: body.title,
        message: body.message,
        topic: messagingResult.topic,
        messageId: messagingResult.messageId,
      }).save()
    ).toObject();
  }

  public async getBroadcastMessages(_): Promise<IBroadcastMessage[]> {
    return await BroadcastMessage.find().lean<IBroadcastMessage[]>().exec();
  }
}
