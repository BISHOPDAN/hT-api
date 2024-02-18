import {
  ChatMessage,
  IChatMessage,
  IGroupedChatMessage,
} from '../../models/chatMessage';
import { createError } from '../../utils/response';
import { ChatHead, IChatHead } from '../../models/chatHead';
import { stripUpdateFields, switchRole } from '../../utils/utils';
import { FilterQuery } from 'mongoose';
import { NotificationService } from './notificationService';
import { UserRole } from '../../models/enums/userRole';
import {
  NotificationGroup,
  NotificationStrategy,
  NotificationTag,
} from '../../models/notification';
import { AppointmentService } from './appointmentService';
import { AttachmentService } from './attachmentService';
import { ObjectId } from 'mongodb';
import { User } from '../../models/user';

export class ChatService {
  public async sendChatMessage(
    user: string,
    role: UserRole,
    body: IChatMessage
  ): Promise<IChatMessage> {
    if (!body.receiver) throw createError('Receiver is required', 400);
    if (!body.appointment) throw createError('Appointment is required', 400);
    if (!body.content && !body.attachment)
      throw createError('Content is required', 400);
    await new AppointmentService().getAppointment(body.appointment.toString());
    stripUpdateFields(body);
    body.sender = user;
    const chatMessageObj: IChatMessage = new ChatMessage(body);
    await this.createChatHead(
      body.sender.toString(),
      body.receiver.toString(),
      chatMessageObj._id
    );
    await this.createChatHead(
      body.receiver.toString(),
      body.sender.toString(),
      chatMessageObj._id
    );
    await chatMessageObj.save();
    const chatMessage = await this.getChatMessage(chatMessageObj._id);
    await new NotificationService().sendNotification(
      {
        userId: body.receiver.toString(),
        title: 'New message',
        ticker: 'New message',
        content: 'You have a new message',
        itemId: body.appointment.toString(),
        role: switchRole(role),
        tag: NotificationTag.APPOINTMENT_MESSAGE,
        group: NotificationGroup.APPOINTMENT_MESSAGE,
      },
      NotificationStrategy.PUSH_ONLY,
      false
    );
    return chatMessage;
  }

  public async sendChatMessageWithAttachment(
    user: string,
    role: UserRole,
    file: any,
    body: IChatMessage
  ): Promise<IChatMessage> {
    if (!file) throw createError('File not attached', 400);
    const attachmentService = new AttachmentService();
    const attachment = await attachmentService.uploadFile(
      file,
      file.mimetype.toString().includes('image')
    );
    body.mimeType = attachment.mimeType;
    body.attachment = attachment;
    return await this.sendChatMessage(user, role, body);
  }

  public async getChatMessages(
    user: string,
    appointment: string,
    conversationId?: string,
    participant?: string
  ): Promise<IChatMessage[]> {
    if (!appointment) throw createError('Appointment is required', 400);
    const filter: FilterQuery<IChatMessage> = { appointment };
    if (conversationId) {
      const chatHead: IChatHead = await ChatHead.findById(conversationId)
        .lean<IChatHead>()
        .exec();
      Object.assign(filter, {
        $or: [
          {
            sender: chatHead.user.toString(),
            receiver: chatHead.participant.toString(),
          },
          {
            receiver: chatHead.user.toString(),
            sender: chatHead.participant.toString(),
          },
        ],
      } as FilterQuery<IChatMessage>);
    } else if (participant) {
      Object.assign(filter, {
        $or: [
          { sender: user.toString(), receiver: participant.toString() },
          { receiver: user.toString(), sender: participant.toString() },
        ],
      } as FilterQuery<IChatMessage>);
    } else {
      throw createError(
        'Must include one of conversation id or participant',
        400
      );
    }
    return await ChatMessage.find(filter)
      .populate('sender receiver')
      .lean<IChatMessage[]>()
      .exec();
  }

  public async getGroupedChatMessages(
    user: string,
    participant: string
  ): Promise<IGroupedChatMessage[]> {
    const objectIdUser = new ObjectId(user);
    const objectIdParticipant = new ObjectId(participant);
    const matchFilter: FilterQuery<IChatMessage> = {
      $or: [
        { sender: objectIdUser, receiver: objectIdParticipant },
        { receiver: objectIdUser, sender: objectIdParticipant },
      ],
    };
    console.log('>>> Match filter: ', matchFilter);
    // console.log('>>> Aggregation result: ', aggregationResult[0]);
    const aggregationResult = await ChatMessage.aggregate()
      .match(matchFilter)
      .lookup({
        from: 'appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appointmentObj',
      })
      .unwind('$appointmentObj')
      .group({
        _id: '$appointmentObj',
        messages: { $push: '$$ROOT' },
      })
      .project({
        _id: 0,
        appointmentId: '$_id._id',
        appointmentIdentifier: {
          $ifNull: ['$_id.identifier', '$_id._id'],
        },
        messages: '$messages',
      })
      .sort({
        'messages.createdAt': -1,
      })
      .exec();
    await User.populate(aggregationResult, 'messages.receiver messages.sender');
    // await Appointment.populate(aggregationResult, 'messages.appointment');
    return aggregationResult;
  }

  public async getChatHeads(user: string): Promise<IChatHead[]> {
    return await ChatHead.find({ user })
      .populate('user participant lastMessage')
      .lean<IChatHead[]>()
      .exec();
  }

  public async getChatMessage(id: string): Promise<IChatMessage> {
    const chatMessage: IChatMessage = await ChatMessage.findById(id)
      .populate('sender receiver')
      .lean<IChatMessage>()
      .exec();
    if (!chatMessage) throw createError('Chat message not found', 400);
    return chatMessage;
  }

  public async getChatHead(
    user: string,
    participant: string,
    validate = true
  ): Promise<IChatHead> {
    const chatHead = await ChatHead.findOne({ user, participant })
      .sort({ updatedAt: 'desc' })
      .lean<IChatHead>()
      .exec();
    if (!chatHead && validate) throw createError('Chat head not found', 404);
    return chatHead;
  }

  private async createChatHead(
    user: string,
    participant: string,
    lastMessage: string
  ): Promise<IChatHead> {
    let chatHead = await this.getChatHead(user, participant, false);
    if (chatHead) {
      chatHead = await ChatHead.findByIdAndUpdate(chatHead._id.toString(), {
        $set: {
          lastMessage,
          seenBy: [user],
        },
      });
    } else {
      chatHead = await ChatHead.create({
        user,
        participant,
        lastMessage,
        seenBy: [user],
      });
    }
    return chatHead;
  }
}
