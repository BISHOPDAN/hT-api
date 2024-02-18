import { IBaseDocument } from '../interfaces/baseInterface';

export enum MentalAssessmentOptionEffect {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  UNCERTAIN = 'uncertain',
}

export interface IMentalAssessmentOption extends IBaseDocument {
  title: string;
  effect: MentalAssessmentOptionEffect;
}

export const mentalAssessmentOptionDef = {
  title: { type: String, required: true },
  effect: {
    type: String,
    required: true,
    default: MentalAssessmentOptionEffect.NEUTRAL,
    enum: Object.values(MentalAssessmentOptionEffect),
  },
};
