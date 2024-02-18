import { Schema, Document, Model, model } from 'mongoose';

export interface ISurgicalHistory extends Document {
  title: string;
  result: string;
  date: Date;
  user: string;
}

const surgicalHistorySchema = new Schema(
  {
    title: { type: String, required: true },
    result: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    
  },
  { timestamps: true }
);

export const SurgicalHistory: Model<ISurgicalHistory> = model<ISurgicalHistory>(
  'surgicalHistory',
  surgicalHistorySchema
);
