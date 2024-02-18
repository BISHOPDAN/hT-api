import { Schema, Model, model } from 'mongoose';
import { UserRole } from './enums/userRole';
import { IBaseDocument } from './interfaces/baseInterface';

export interface IFcmToken extends IBaseDocument {
  userId: string;
  role: UserRole;
  token: string;
  deviceId: string;
}

const fcmTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    role: { type: String, required: true, default: UserRole.PATIENT },
    token: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  { timestamps: true }
);

export const FcmToken: Model<IFcmToken> = model<IFcmToken>(
  'fcmToken',
  fcmTokenSchema
);
