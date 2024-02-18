import { Json } from 'aws-sdk/clients/robomaker';
import { GeneralResponse, QuestionType, WorriesResponse } from './enums/generalEnum';
import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
import { IOptions, Options } from './options';
const MongoPaging = require('mongo-cursor-pagination');

export interface IQuestion extends IBaseDocument {
  index: Number;
  text: String;
  type: QuestionType;
  options: IOptions;
  
}

const questionSchema = new Schema({
    index:{ type: Number, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: Object.values(QuestionType), required: true },
    options: { type: Schema.Types.ObjectId, ref: 'option',  required: true }
});

questionSchema.plugin(MongoPaging.mongoosePlugin);

export const Question: Model<IQuestion> = model<IQuestion>(
  'question',
  questionSchema
);
