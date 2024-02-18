
import { ISurgicalHistory, SurgicalHistory } from "../../models/medicalRecord/surgicalhistory";
import { createError } from "../../utils/response";


export class SurgicalHistorySeervice {
    public async createBloodTest(body: ISurgicalHistory): Promise<ISurgicalHistory> {
        if (!body.title) throw createError('title is required', 400);
        if (!body.result) throw createError('result is required', 400);
        let surgicalHistory = await SurgicalHistory.findOne({ user: body.user })
          .lean<ISurgicalHistory>()
          .exec();
        if (surgicalHistory) return surgicalHistory;
        
        return await new SurgicalHistory(body).save();
      }

      public async updateSurgicalHistory(id: String, body: ISurgicalHistory): Promise<ISurgicalHistory> {
        
        let surgicalHistory = await SurgicalHistory.findByIdAndUpdate(
            id,
            {
              $set: {
                title: body.title,
                result: body.result,

              },
            },
            { new: true })
            .lean<ISurgicalHistory>()
            .exec();
            return surgicalHistory;
      }

      public async deleteSurgicalHistory(id: string): Promise<void> {
        const surgicalHistory = await SurgicalHistory.findById(id)
          .lean<ISurgicalHistory>()
          .exec();
        if (!surgicalHistory) throw createError('Record does not exist', 404);
        await SurgicalHistory.findByIdAndDelete(id).exec();
      }

      public async getSurgicalHistory(user: String): Promise<ISurgicalHistory> {
        
        let surgicalHistory = await SurgicalHistory.find({ user: user })
          .lean<ISurgicalHistory>()
          .exec();
        if (!surgicalHistory) throw createError('user does not have any blood pressure record', 400);
        return surgicalHistory;
      }

}
