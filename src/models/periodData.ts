import { IBaseDocument } from './interfaces/baseInterface';
import { IUser } from './user';
import {
  IPersonalHealthQueryResponse,
  personHealthQueryResponsesSchema,
} from './personalHealthQuery';
import { Schema } from 'mongoose';

export interface IPeriodData extends IBaseDocument {
  user: string | IUser;
  date: Date;
  periodDate: Date;
  nextOvulationDate: Date;
  nextPeriodDate: Date;
  periodDates: Date[];
  nextOvulationDates: Date[];
  responses: IPersonalHealthQueryResponse[];
}

export const periodDataSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    date: { type: Date, required: true },
    periodDate: { type: Date, required: true },
    nextOvulationDate: { type: Date, required: true },
    nextPeriodDate: { type: Date, required: true },
    periodDates: { type: [Date], required: true },
    nextOvulationDates: { type: [Date], required: true },
    responses: {
      type: [personHealthQueryResponsesSchema],
      default: [],
    },
  },
  { timestamps: true }
);
