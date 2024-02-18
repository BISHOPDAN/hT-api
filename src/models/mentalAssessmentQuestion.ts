import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
import {
  IMentalAssessmentOption,
  MentalAssessmentOptionEffect,
} from './definitions/mentalAssessmentQuestionDef';

export interface IMentalAssessmentQuestion extends IBaseDocument {
  title: string;
  options: IMentalAssessmentOption[];
}

const mentalAssessmentQuestionSchema = new Schema({
  title: { type: String, required: true },
  options: {
    type: [
      {
        title: { type: String, required: true },
        effect: {
          type: String,
          required: true,
          default: MentalAssessmentOptionEffect.NEUTRAL,
          enum: Object.values(MentalAssessmentOptionEffect),
        },
      },
    ],
    default: [],
  },
});

export const MentalAssessmentQuestion: Model<IMentalAssessmentQuestion> =
  model<IMentalAssessmentQuestion>(
    'mentalAssessmentQuestion',
    mentalAssessmentQuestionSchema
  );
