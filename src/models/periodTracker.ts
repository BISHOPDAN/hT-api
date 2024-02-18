import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
const MongoPaging = require('mongo-cursor-pagination');

export interface IPeriodTracker extends IBaseDocument {
  cycleVaries: string;
  disconfortReason: string;
  reproductiveHealthDisorder: string;
  lastPeriodStart: Date;
  newPeriodStart: Date;
  user: string;
}

const periodTrackerSchema = new Schema({
    cycleVaries: { type: String, required: true },
    disconfortReason: { type: String, required: true },
    reproductiveHealthDisorder: { type: String, required: true },
    lastPeriodStart: {type: Date, require: true},
    newPeriodStart:{type: Date, require: false},
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
});

periodTrackerSchema.plugin(MongoPaging.mongoosePlugin);

export const PeriodTracker: Model<IPeriodTracker> = model<IPeriodTracker>(
  'periodTracker',
  periodTrackerSchema
);
