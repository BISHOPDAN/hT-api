import { IBaseDocument } from './interfaces/baseInterface';
import { IUser } from './user';
import {
  fitnessExerciseGroupSchema,
  IFitnessExerciseGroup,
} from './fitnessExerciseGroup';
import { Schema } from 'mongoose';
import { ModelName } from './enums/modelName';
import { IPersonalHealthQuery } from './personalHealthQuery';

export enum FitnessPlanStatus {
  PROCESSING = 'processing',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum FitnessPlanLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum FitnessPlanType {
  PERSONAL = 'personal',
  GENERAL = 'general',
}

export interface IFitnessPlan extends IBaseDocument {
  user: string | IUser;
  type: FitnessPlanType;
  level: FitnessPlanLevel;
  status: FitnessPlanStatus;
  exerciseGroups: IFitnessExerciseGroup[];
  personalHealthQuery?: string | IPersonalHealthQuery;
  appointment?: string;
}

export const fitnessPlanSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'appointment',
      required: false,
    },
    personalHealthQuery: {
      type: Schema.Types.ObjectId,
      ref: ModelName.PERSONAL_HEALTH_QUERY,
      required: false,
    },
    type: {
      type: String,
      enum: Object.values(FitnessPlanType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FitnessPlanStatus),
      default: FitnessPlanStatus.PROCESSING,
      required: true,
    },
    level: {
      type: String,
      required: false,
      enum: Object.values(FitnessPlanLevel),
    },
    exerciseGroups: [fitnessExerciseGroupSchema],
  },
  { timestamps: true }
);
