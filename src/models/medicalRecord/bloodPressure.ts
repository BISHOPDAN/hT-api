import { Schema, Document, Model, model } from 'mongoose';

export interface IBloodPressure extends Document {
  systolic: number;
  diastolic: number;
  pulse: number;
  date: Date;
  user: string;
}

const bloodPressureSchema = new Schema(
  {
    systolic: { type: Number, required: true },
    diastolic: { type: Number, required: true },
    pulse: { type: Number, required: true },
    date: { type: Date,required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    
  },
  { timestamps: true }
);

export const BloodPressure: Model<IBloodPressure> = model<IBloodPressure>(
  'bloodPressure',
  bloodPressureSchema
);
