
import { BloodPressure, IBloodPressure } from "../../models/medicalRecord/bloodPressure";
import { createError } from "../../utils/response";


export class BloodPressureService {
    public async createBloodPressure(body: IBloodPressure): Promise<IBloodPressure> {
        if (!body.systolic) throw createError('systolic information is required', 400);
        if (!body.pulse) throw createError('pulse information is required', 400);
        if (!body.diastolic) throw createError('diastolic information is required', 400);
        if (!body.date) throw createError('date is required', 400);
        let bloodPressure = await BloodPressure.findOne({ user: body.user })
          .lean<IBloodPressure>()
          .exec();
        if (bloodPressure) return bloodPressure;
        
        return await new BloodPressure(body).save();
      }

      public async updateBloodPressure(id: String, body: IBloodPressure): Promise<IBloodPressure> {
        
        let bloodPressure = await BloodPressure.findByIdAndUpdate(
            id,
            {
              $set: {
                systolic: body.systolic,
                diastolic: body.diastolic,
                pulse: body.pulse,
              },
            },
            { new: true })
            .lean<IBloodPressure>()
            .exec();
            return bloodPressure;
      }

      public async deleteBloodPressure(id: string): Promise<void> {
        const bloodPressure = await BloodPressure.findById(id)
          .lean<IBloodPressure>()
          .exec();
        if (!bloodPressure) throw createError('Record does not exist', 404);
        await BloodPressure.findByIdAndDelete(id).exec();
      }

      public async getBloodPressure(user: String): Promise<IBloodPressure> {
        
        let bloodPressure = await BloodPressure.find({ user: user })
          .lean<IBloodPressure>()
          .exec();
        if (!bloodPressure) throw createError('user does not have any blood pressure record', 400);
        return bloodPressure;
      }

}
