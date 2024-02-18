import { Schema, Document, Model, model } from 'mongoose';

export interface IChronicCondition extends Document {
  name: string;
  date: Date;
  user: string;
}

const chronicConditionSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    
  },
  { timestamps: true }
);

export const ChronicCondition: Model<IChronicCondition> = model<IChronicCondition>(
  'chronicCondition',
  chronicConditionSchema
);
