import { Schema } from 'mongoose';
import { IBaseDocument } from './interfaces/baseInterface';
import { HealthEntity } from './enums/health-choice-entity.enum';

export interface IHealthGuideBenefit extends IBaseDocument {
  title: string;
  description: string;
}

export interface IHealthGuide extends IBaseDocument {
  entity: HealthEntity;
  title: string;
  benefits: IHealthGuideBenefit[];
}

export const healthGuideSchema = new Schema(
  {
    entity: {
      type: String,
      required: true,
      enum: Object.values(HealthEntity),
    },
    title: { type: String, required: true },
    benefits: {
      type: [
        {
          title: { type: String },
          description: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);
