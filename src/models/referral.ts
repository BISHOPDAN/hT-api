import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
const MongoPaging = require('mongo-cursor-pagination');

export interface IReferral extends IBaseDocument {
  name: string;
  email: string;
  code: string;
  users: string[];
}

const referralSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  code: { type: String, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'user' }],
});

referralSchema.plugin(MongoPaging.mongoosePlugin);

export const Referral: Model<IReferral> = model<IReferral>(
  'referral',
  referralSchema
);
