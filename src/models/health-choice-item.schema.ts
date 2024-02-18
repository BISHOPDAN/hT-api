import { Schema } from 'mongoose';
import { HealthEntity } from './enums/health-choice-entity.enum';
import { HealthChoiceItem } from './enums/health-choice-item.enum';
import { IBaseDocument } from './interfaces/baseInterface';

export interface IHealthChoice extends IBaseDocument {
  parentEntities: HealthEntity[];
  item: HealthChoiceItem;
  title: string;
  tags: string[];
}

export const healthChoiceSchema = new Schema(
  {
    parentEntities: {
      type: [String],
      required: true,
      enum: Object.values(HealthEntity),
    },
    item: {
      type: String,
      required: false,
      enum: Object.values(HealthChoiceItem),
    },
    title: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);
