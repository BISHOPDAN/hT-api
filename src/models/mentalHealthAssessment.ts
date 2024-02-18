import { GeneralResponse, WorriesResponse } from './enums/generalEnum';
import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
const MongoPaging = require('mongo-cursor-pagination');

export interface IMentalHealthAssessment extends IBaseDocument {
  feeling_depressed: GeneralResponse;
  interest_doing_things: GeneralResponse;
  falling_asleep_difficulty: GeneralResponse;
  sleeping_too_much: GeneralResponse;
  poor_appetite: GeneralResponse;
  over_eating: GeneralResponse;
  letting_people_down: GeneralResponse;
  easily_irritated: GeneralResponse;
  worrying_about: WorriesResponse;
  seeDoctor: boolean;
  user: string;
}

const mentalHealthAssessmentSchema = new Schema({
    feeling_depressed:  { type: String, enum: Object.values(GeneralResponse), required: true },
    interest_doing_things: { type: String, enum: Object.values(GeneralResponse), required: true },
    falling_asleep_difficulty: { type: String, enum: Object.values(GeneralResponse), required: true },
    sleeping_too_much: { type: String, enum: Object.values(GeneralResponse), required: true },
    poor_appetite:{ type: String, enum: Object.values(GeneralResponse), required: true },
    over_eating:{ type: String, enum: Object.values(GeneralResponse), required: true },
    letting_people_down:{ type: String, enum: Object.values(GeneralResponse), required: true },
    easily_irritated:{ type: String, enum: Object.values(GeneralResponse), required: true },
    worrying_about:{ type: String, enum: Object.values(WorriesResponse), required: true },
    seeDoctor: {type: Boolean, required: true},
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
});

mentalHealthAssessmentSchema.plugin(MongoPaging.mongoosePlugin);

export const MentalHealthAssessment: Model<IMentalHealthAssessment> = model<IMentalHealthAssessment>(
  'mentalHealthAssessment',
  mentalHealthAssessmentSchema
);
