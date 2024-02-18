import { responseRanking } from "../../models/definitions/ResponseRanking";
import { GeneralResponse } from "../../models/enums/generalEnum";
import { MenstralCycleEnum } from "../../models/enums/periodTrackerEnum";
import { IMentalHealthAssessment, MentalHealthAssessment } from "../../models/mentalHealthAssessment";
import { IPeriodTracker, PeriodTracker } from "../../models/periodTracker";
import { createError } from "../../utils/response";


export class MentalHealthAssessmentService {
    public async createMentalHealthAssessment(body: IMentalHealthAssessment): Promise<IMentalHealthAssessment> {
      
   
        let mentalHealthAssessment = await MentalHealthAssessment.findOne({ user: body.user })
          .lean<IMentalHealthAssessment>()
          .exec();
          console.log(mentalHealthAssessment)

        if (mentalHealthAssessment) return mentalHealthAssessment;
        const newAssessment = new MentalHealthAssessment(body);
        newAssessment.seeDoctor = this.analyseResponse(body);
        return await new MentalHealthAssessment(body).save();
      }
      
      public analyseResponse(response:IMentalHealthAssessment ){
       
        const responseMap = Object.keys(response).map(key => ({
            key, 
            value: response[key as keyof IMentalHealthAssessment],
            rank: this._calculateRank(response[key as keyof IMentalHealthAssessment])
          }));

          const totalRank = responseMap.reduce((sum, current) => sum + Number(current.rank), 0);
          const count = responseMap.filter(item => Number(item.rank) > 0).length;
          const result = totalRank/count
          return result > 1.5? true: false;
      }



      public async getResponse(user:string ){
       
        let mentalHealthAssessment = await MentalHealthAssessment.findOne({ user: user})
          .lean<IMentalHealthAssessment>()
          .exec();
          return mentalHealthAssessment;
      }


       _calculateRank(response: GeneralResponse): Number {
        // Create a Date object for the next menstrual period.
        const rank = responseRanking.filter(p=>p.key === response)
        if (rank.length === 0){
            return 0
        }
        return rank[0].value
      }

      

}
