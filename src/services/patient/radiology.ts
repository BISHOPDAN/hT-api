
import { Radiology, IRadiology } from "../../models/medicalRecord/radiology";
import { createError } from "../../utils/response";


export class RadiologyService {
    public async createRadiology(body: IRadiology): Promise<IRadiology> {
        if (!body.result) throw createError('result is required', 400);
        if (!body.title) throw createError('title is required', 400);
        let radiology = await Radiology.findOne({ user: body.user })
          .lean<IRadiology>()
          .exec();
        if (radiology) return radiology;
        
        return await new Radiology(body).save();
      }

      public async updateRadiology(id: String, body: IRadiology): Promise<IRadiology> {
        
        let radiology = await Radiology.findByIdAndUpdate(
            id,
            {
              $set: {
                result: body.result,
                title: body.title,
              },
            },
            { new: true })
            .lean<IRadiology>()
            .exec();
            return radiology;
      }

      public async deleteRadiology(id: string): Promise<void> {
        const radiology = await Radiology.findById(id)
          .lean<IRadiology>()
          .exec();
        if (!radiology) throw createError('Record does not exist', 404);
        await Radiology.findByIdAndDelete(id).exec();
      }

      public async getRadiology(user: String): Promise<IRadiology> {
        
        let radiology = await Radiology.find({ user: user })
          .lean<IRadiology>()
          .exec();
        if (!radiology) throw createError('user does not have any blood pressure record', 400);
        return radiology;
      }

}
