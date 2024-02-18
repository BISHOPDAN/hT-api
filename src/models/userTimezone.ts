import { IBaseDocument } from './interfaces/baseInterface';
import { Schema } from 'mongoose';

export interface IUserTimezone extends IBaseDocument {
  user: string;
  timezone: string;
}

export const userTimeZoneSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  timezone: { type: Schema.Types.ObjectId, ref: 'user', required: true },
});
