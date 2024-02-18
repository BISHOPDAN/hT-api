import { fitnessCategory, fitnessFocus, fitnessPackage } from './enums/fitnessCategory';
import { Status } from './enums/generalEnum';
import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
const MongoPaging = require('mongo-cursor-pagination');

export interface IFitness extends IBaseDocument {
  name: string;
  focus: fitnessFocus;
  description: string;
  number_of_count: number;
  number_of_rep: number;
  category: fitnessCategory;
  imageUrl: string;
  package: fitnessPackage;
  status: Status;
}

const fitnessSchema = new Schema({
    name: { type: String, required: true },
    focus:{ type: String, enum: Object.values(fitnessFocus), required: true },
    description: { type: String, required: true },
    number_of_count: { type: Number, required: true },
    number_of_rep: { type: Number, required: true },
    category: { type: String, enum: Object.values(fitnessCategory), required: true },
    imageUrl: { type: String, required: true },
    package:{ type: String, enum: Object.values(fitnessPackage), required: true },
    status: { type: String, enum: Object.values(Status), required: true },

});

fitnessSchema.plugin(MongoPaging.mongoosePlugin);

export const Fitness: Model<IFitness> = model<IFitness>(
  'fitness',
  fitnessSchema
);
