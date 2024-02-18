import { IBaseDocument } from './interfaces/baseInterface';
import { IUser } from './user';
import { IAttachment } from './attachment';
import { model, Model, Schema } from 'mongoose';
import { attachmentDef } from './definitions/attachmentDef';
import { IAppointment } from './appointment';

export interface IGroupedChatMessage {
  appointmentId: string;
  appointment: IAppointment;
  messages: IChatMessage;
}

export interface IChatMessage extends IBaseDocument {
  sender: string | IUser;
  receiver: string | IUser;
  identifier: string;
  appointment: string | IAppointment;
  content: string;
  mimeType: string;
  attachment?: IAttachment;
}

const chatMessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'appointment',
      required: true,
    },
    identifier: { type: String, required: true },
    content: { type: String, required: false },
    mimeType: { type: String, required: true, default: 'text/plain' },
    attachment: { type: attachmentDef, required: false },
  },
  { timestamps: true }
);

export const ChatMessage: Model<IChatMessage> = model<IChatMessage>(
  'chatMessage',
  chatMessageSchema
);
