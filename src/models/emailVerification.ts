import { model, Model, Schema } from 'mongoose';
import {
  AuthVerificationReason,
  AuthVerificationSource,
} from './enums/authVerificationReason';
import { IBaseDocument } from './interfaces/baseInterface';
export interface IEmailVerification extends IBaseDocument {
  reason: AuthVerificationReason;
  source: AuthVerificationSource;
  email: string;
  expiresIn: Date;
  code: string;
  verified: boolean;
}

const emailVerificationSchema = new Schema(
  {
    reason: { type: String, required: true },
    source: {
      type: String,
      required: true,
      default: AuthVerificationSource.MOBILE,
    },
    email: { type: String, required: true },
    expiresIn: { type: Date, required: true },
    code: { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const EmailVerification: Model<IEmailVerification> =
  model<IEmailVerification>('emailVerification', emailVerificationSchema);
