import { Schema, Document, Model, model } from 'mongoose';
import { MedicationType } from '../enums/generalEnum';

export interface IInsurrance extends Document {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  user: string;
}

const insurranceSchema = new Schema(
  {
    provider: { type: String, required: true },
    policyNumber: { type: String, required: true },
    groupNumber: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
  },
  { timestamps: true }
);

export const Insurrance: Model<IInsurrance> = model<IInsurrance>(
  'insurrance',
  insurranceSchema
);
