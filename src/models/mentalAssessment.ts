import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
import {
  IMentalAssessmentOption,
  mentalAssessmentOptionDef,
} from './definitions/mentalAssessmentQuestionDef';

export interface IMentalAssessmentQuestionReply {
  question: string;
  options: IMentalAssessmentOption;
}

export interface IMentalAssessment extends IBaseDocument {
  user: string;
  replies: IMentalAssessmentQuestionReply[];
}

export const mentalAssessmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    replies: {
      type: [
        {
          question: { type: String, required: true },
          options: { type: [mentalAssessmentOptionDef] },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const MentalAssessment: Model<IMentalAssessment> =
  model<IMentalAssessment>('mentalAssessment', mentalAssessmentSchema);
