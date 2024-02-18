import { fitnessCategory, fitnessFocus, fitnessPackage } from './enums/fitnessCategory';
import { Gender } from './enums/generalEnum';
import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
const MongoPaging = require('mongo-cursor-pagination');

export interface IUserFitness extends IBaseDocument {
  fitnessPackage: fitnessPackage;
  amountPaid: number;
  gender: Gender;
  focusArea: fitnessFocus;
  existingHealthCondition: string;
  injury: string;
  chestPain: string;
  heartCondition: string;
  medication: string;
  doubtOboutHealth: string;
  dayPerweek: number;
  startDate: Date;
  user: string;
}

const userFitnessSchema = new Schema({
    fitnessPackage: { type: String, enum: Object.values(fitnessPackage), required: true },
    amountPaid: { type: Number, required: false },
    gender: { type: String, enum: Object.values(Gender), required: false },
    focusArea: { type: String, enum: Object.values(fitnessFocus), required: false },
    existingHealthCondition: { type: String, required: false },
    dayPerweek: { type: Number, required: false },
    startDate: { type: Date, required: false },
    injury: { type: String, required: false },
    chestPain: { type: String, required: false },
    heartCondition: { type: String, required: false },
    medication: { type: String, required: false },
    doubtOboutHealth: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
});

userFitnessSchema.plugin(MongoPaging.mongoosePlugin);

export const UserFitness: Model<IUserFitness> = model<IUserFitness>(
  'userFitness',
  userFitnessSchema
);
