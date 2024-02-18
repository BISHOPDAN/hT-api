import { Schema, Document, Model, model } from 'mongoose';

export interface IBloodTest extends Document {
  bloodType: string;
  genotype: string;
  user: string;
}

const bloodTestSchema = new Schema(
  {
    bloodType: { type: String, required: true },
    genotype: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    
  },
  { timestamps: true }
);

export const BloodTest: Model<IBloodTest> = model<IBloodTest>(
  'bloodtest',
  bloodTestSchema
);
