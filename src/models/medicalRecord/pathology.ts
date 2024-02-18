import { Schema, Document, Model, model } from 'mongoose';

export interface IPathology extends Document {
  result: string;
  title: string;
  date: Date;
  user: string;
}

const pathologySchema = new Schema(
  {
    result: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    
  },
  { timestamps: true }
);

export const Pathology: Model<IPathology> = model<IPathology>(
  'pathology',
  pathologySchema
);
