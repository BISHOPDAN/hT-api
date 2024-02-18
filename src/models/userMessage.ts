import { model, Model, Schema } from 'mongoose';

export interface IUserMessage {
  user: string;
  title: string;
  content: string;
  sentBy: string;
}

const userMessageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: false },
    content: { type: String, required: true },
    sentBy: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    visibleToUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserMessage: Model<IUserMessage> = model<IUserMessage>(
  'userMessage',
  userMessageSchema
);
