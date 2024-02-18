import { IBaseDocument } from './interfaces/baseInterface';
import { IAttachment } from './attachment';
import { Schema } from 'mongoose';
import { IFitnessExerciseGroup } from './fitnessExerciseGroup';
import { ModelName } from './enums/modelName';
import { attachmentDef } from './definitions/attachmentDef';

export interface IFitnessExercise extends IBaseDocument {
  title: string;
  exerciseGroup: string | IFitnessExerciseGroup;
  coverAttachment: IAttachment;
  mediaAttachments: [IAttachment];
  instructions: string;
  reps: number;
  sets: number;
  notes: string;
}

export const fitnessExerciseSchema = new Schema(
  {
    title: { type: String, required: true },
    exerciseGroup: {
      type: Schema.Types.ObjectId,
      ref: ModelName.FITNESS_EXERCISE_GROUP,
    },
    coverAttachment: attachmentDef,
    mediaAttachments: [attachmentDef],
    reps: { type: Number, required: false },
    sets: { type: Number, required: false },
    instructions: { type: String, required: false },
    notes: { type: String, required: false },
  },
  { timestamps: true }
);
