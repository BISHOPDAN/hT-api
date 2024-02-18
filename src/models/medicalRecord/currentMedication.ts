import { Schema, Document, Model, model } from 'mongoose';
import { MedicationType } from '../enums/generalEnum';

export interface ICurrentMed extends Document {
  name: string;
  dossage: string;
  frequency: Date;
  medicationType: MedicationType;
  user: string;
}

const currentMedSchema = new Schema(
  {
    name: { type: String, required: true },
    dossage: { type: String, required: true },
    medicationType: { type: String, enum: Object.values(MedicationType), required: true },
    frequency: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
  },
  { timestamps: true }
);

export const CurrentMed: Model<ICurrentMed> = model<ICurrentMed>(
  'currentMed',
  currentMedSchema
);
