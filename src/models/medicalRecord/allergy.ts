import { Schema, Document, Model, model } from 'mongoose';

export interface IAllergy extends Document {
  allergies: string[];
  user: string;
}

const allergySchema = new Schema(
  {
    allergies: [{ type: String, required: true }],
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    
  },
  { timestamps: true }
);

export const Allergy: Model<IAllergy> = model<IAllergy>(
  'allergy',
  allergySchema
);
