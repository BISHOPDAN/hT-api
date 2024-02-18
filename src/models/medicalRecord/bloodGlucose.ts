import { Schema, Document, Model, model } from 'mongoose';
import { GlucoseTestType } from '../enums/generalEnum';

export interface IBloodGlugose extends Document {
  result: string;
  testType: GlucoseTestType;
  date: Date;
  user: string;
}

const bloodGlugoseSchema = new Schema(
  {
    result: { type: String, required: true },
    testType: { type: String, enum: Object.values(GlucoseTestType), required: true },
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    
  },
  { timestamps: true }
);

export const BloodGlugose: Model<IBloodGlugose> = model<IBloodGlugose>(
  'bloodGlugose',
  bloodGlugoseSchema
);
