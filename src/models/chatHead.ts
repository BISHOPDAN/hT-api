import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
import { IUser } from './user';
import { IChatMessage } from './chatMessage';

export interface IChatHead extends IBaseDocument {
  user: string | IUser;
  participant: string | IUser;
  seenBy: string[];
  lastMessage: string | IChatMessage;
}

const chatSetSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    participant: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    seenBy: { type: [String], default: [] },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'chatMessage',
      required: true,
    },
  },
  { timestamps: true }
);

export const ChatHead: Model<IChatHead> = model<IChatHead>(
  'chatHead',
  chatSetSchema
);
