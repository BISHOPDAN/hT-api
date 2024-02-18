import { Json } from 'aws-sdk/clients/robomaker';
import { GeneralResponse, QuestionType, WorriesResponse } from './enums/generalEnum';
import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
const MongoPaging = require('mongo-cursor-pagination');

export interface IOptions extends IBaseDocument {
  index: Number;
  text: String;
  key: String;
  value: String;
  
}

const optionSchema = new Schema({
    index:{ type: Number, required: true },
    text: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
    
});

optionSchema.plugin(MongoPaging.mongoosePlugin);

export const Options: Model<IOptions> = model<IOptions>(
  'option',
  optionSchema
);
