import { UserRole } from './enums/userRole';
import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';

export interface IBroadcastMessage extends IBaseDocument {
  role: UserRole;
  topic: string;
  title: string;
  message: string;
  messageId: string;
}

const broadcastMessageSchema = new Schema(
  {
    role: { type: String, enum: Object.values(UserRole), required: false },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    messageId: { type: String, required: true },
  },
  { timestamps: true }
);

export const BroadcastMessage: Model<IBroadcastMessage> =
  model<IBroadcastMessage>('broadcastMessage', broadcastMessageSchema);
