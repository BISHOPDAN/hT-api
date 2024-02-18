import { responseRanking } from "../../models/definitions/ResponseRanking";
import { GeneralResponse } from "../../models/enums/generalEnum";
import { MenstralCycleEnum } from "../../models/enums/periodTrackerEnum";
import { IPeriodTracker, PeriodTracker } from "../../models/periodTracker";
import { IQuestion, Question } from "../../models/questions";
import { createError } from "../../utils/response";


export class QuestionService {
    public async createQuestion(body: IQuestion): Promise<IQuestion> {
        
        if (!body.options) throw createError('Question must have an option', 400);
        let question = await Question.findOne({ type: body.type, text:body.text })
          .lean<IQuestion>()
          .exec();
        if (question) throw createError('Question with text and type already exist', 400);
        return await new Question(body).save();
      }


      public async getQuestion(questionType:string ){
       
        let questions = await Question.find({ type: questionType})
          .lean<IQuestion>()
          .exec();
          return questions
      }

      public async updateQuestions(id: String, body: IQuestion): Promise<IQuestion> {
        
        let question = await Question.findByIdAndUpdate(
            id,
            {
              $set: {
                index: body.index,
                text: body.text,
                type: body.type,
                options: body.options
                
              },
            },
            { new: true })
            .lean<IQuestion>()
            .exec();
            return question;
      }

}
