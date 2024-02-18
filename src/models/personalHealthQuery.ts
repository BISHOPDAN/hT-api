import { IBaseDocument } from './interfaces/baseInterface';
import { IUser } from './user';
import { Schema } from 'mongoose';
import { Gender } from './enums/generalEnum';
import { HealthEntity } from './enums/health-choice-entity.enum';

export interface IPersonalHealthQuery extends IBaseDocument {
  user: string | IUser;
  entity: HealthEntity;
  forSelf: boolean;
  userInfo: IUser;
  responses: IPersonalHealthQueryResponse[];
}

export interface IPersonalHealthQueryResponse extends IBaseDocument {
  question: string;
  answers: string[];
}

export const personHealthQueryResponsesSchema = new Schema(
  {
    question: { type: String, required: true },
    answers: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const personalHealthQuerySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    entity: {
      type: String,
      required: true,
      enum: Object.values(HealthEntity),
    },
    forSelf: { type: Boolean, required: false },
    userInfo: {
      gender: {
        type: String,
        required: false,
        enum: [Gender.MALE, Gender.FEMALE, Gender.NIL],
      },
      age: { type: String, required: false },
      weight: { type: String, required: false },
      height: { type: String, required: false },
    },
    responses: {
      type: [personHealthQueryResponsesSchema],
      default: [],
    },
  },
  { timestamps: true }
);
