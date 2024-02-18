import { IBaseDocument } from './interfaces/baseInterface';
import { IAttachment } from './attachment';
import { Schema } from 'mongoose';
import { attachmentDef } from './definitions/attachmentDef';
import { fitnessExerciseSchema, IFitnessExercise } from './fitnessExercise';

export interface IFitnessExerciseGroup extends IBaseDocument {
  title: string;
  coverAttachment: IAttachment;
  level: string | undefined;
  exercises: IFitnessExercise[];
}

export const fitnessExerciseGroupSchema = new Schema(
  {
    title: { type: String, required: true },
    level: { type: String, required: false },
    coverAttachment: attachmentDef,
    exercises: [fitnessExerciseSchema],
  },
  { timestamps: true }
);
