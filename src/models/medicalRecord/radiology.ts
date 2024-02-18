import { Schema, Document, Model, model } from 'mongoose';

export interface IRadiology extends Document {
  result: string;
  title: string;
  date: Date;
  user: string;
}

const radiologySchema = new Schema(
  {
    result: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    
  },
  { timestamps: true }
);

export const Radiology: Model<IRadiology> = model<IRadiology>(
  'radiology',
  radiologySchema
);
