
import { BloodGlugose, IBloodGlugose } from "../../models/medicalRecord/bloodGlucose";
import { createError } from "../../utils/response";


export class BloodGlugoseService {
    public async createBloodGlugose(body: IBloodGlugose): Promise<IBloodGlugose> {
        if (!body.result) throw createError('result is required', 400);
        if (!body.testType) throw createError('testType is required', 400);
        let bloodGlucose = await BloodGlugose.findOne({ user: body.user })
          .lean<IBloodGlugose>()
          .exec();
        if (bloodGlucose) return bloodGlucose;
        
        return await new BloodGlugose(body).save();
      }

      public async updateBloodGlugose(id: String, body: IBloodGlugose): Promise<IBloodGlugose> {
        
        let bloodGlucose = await BloodGlugose.findByIdAndUpdate(
            id,
            {
              $set: {
                result: body.result,
                testType: body.testType,
              },
            },
            { new: true })
            .lean<IBloodGlugose>()
            .exec();
            return bloodGlucose;
      }

      public async deleteBloodGlugose(id: string): Promise<void> {
        const bloodGlucose = await BloodGlugose.findById(id)
          .lean<IBloodGlugose>()
          .exec();
        if (!bloodGlucose) throw createError('Record does not exist', 404);
        await BloodGlugose.findByIdAndDelete(id).exec();
      }

      public async getBloodGlugose(user: String): Promise<IBloodGlugose> {
        
        let bloodGlugose = await BloodGlugose.find({ user: user })
          .lean<IBloodGlugose>()
          .exec();
        if (!bloodGlugose) throw createError('user does not have any blood pressure record', 400);
        return bloodGlugose;
      }

}
