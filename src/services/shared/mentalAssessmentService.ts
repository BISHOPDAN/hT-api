import {
  IMentalAssessmentQuestion,
  MentalAssessmentQuestion,
} from '../../models/mentalAssessmentQuestion';
import { createError } from '../../utils/response';
import { getUpdateOptions, stripUpdateFields } from '../../utils/utils';
import {
  IMentalAssessment,
  MentalAssessment,
} from '../../models/mentalAssessment';

export class MentalAssessmentService {
  async addQuestion(
    body: IMentalAssessmentQuestion
  ): Promise<IMentalAssessmentQuestion> {
    if (!body.title) throw createError('Title is required', 400);
    if (
      !body.options ||
      !Array.isArray(body.options) ||
      body.options.length === 0
    )
      throw createError('At least one option is required', 400);
    stripUpdateFields(body);
    return await MentalAssessmentQuestion.findOneAndUpdate(
      {
        title: body.title,
      },
      body,
      getUpdateOptions()
    ).exec();
  }

  async getQuestions(): Promise<IMentalAssessmentQuestion[]> {
    return await MentalAssessmentQuestion.find()
      // .limit(2)
      .lean<IMentalAssessmentQuestion[]>()
      .exec();
  }

  async getQuestion(id: string): Promise<IMentalAssessmentQuestion> {
    const mentalAssessmentQuestion = await MentalAssessmentQuestion.findById(id)
      .lean<IMentalAssessmentQuestion>()
      .exec();
    if (!mentalAssessmentQuestion) throw createError('Question not found', 404);
    return mentalAssessmentQuestion;
  }

  async deleteQuestion(id: string) {
    const question = await this.getQuestion(id);
    await MentalAssessmentQuestion.deleteOne({ _id: question._id }).exec();
    return question;
  }

  async submitAssessment(
    user: string,
    body: IMentalAssessment
  ): Promise<IMentalAssessment> {
    console.log('>>> Submitting replies: ', body);
    if (
      !body.replies ||
      !Array.isArray(body.replies) ||
      body.replies.length === 0
    )
      throw createError('Replies required', 400);
    return await MentalAssessment.findOneAndUpdate(
      { user: user },
      body,
      getUpdateOptions()
    ).exec();
  }

  async getAssessment(user: string): Promise<IMentalAssessment> {
    return await MentalAssessment.findOne({ user: user }).exec();
  }
}
