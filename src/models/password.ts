import { model, Model, Schema, Document } from 'mongoose';
import { IBaseDocument } from './interfaces/baseInterface';

export interface IPassword extends IBaseDocument {
  userId: string;
  password: string;
  rawPassword?: string;
  temporary: boolean;
}

const passwordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    password: { type: String, required: true },
    rawPassword: { type: String, required: false },
    temporary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Password: Model<IPassword> = model<IPassword>(
  'password',
  passwordSchema
);
