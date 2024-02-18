
import { Insurrance, IInsurrance } from "../../models/medicalRecord/insurrance";
import { createError } from "../../utils/response";


export class InsurranceService {
    public async createInsurrance(body: IInsurrance): Promise<IInsurrance> {
        if (!body.policyNumber) throw createError('policyNumber is required', 400);
        if (!body.provider) throw createError('provider is required', 400);
        if (!body.groupNumber) throw createError('groupNumber is required', 400);
        let insurrance = await Insurrance.findOne({ user: body.user })
          .lean<IInsurrance>()
          .exec();
        if (insurrance) return insurrance;
        
        return await new Insurrance(body).save();
      }

      public async updateInsurrance(id: String, body: IInsurrance): Promise<IInsurrance> {
        
        let insurrance = await Insurrance.findByIdAndUpdate(
            id,
            {
              $set: {
                policyNumber: body.policyNumber,
                provider: body.provider,
                groupNumber: body.groupNumber
              },
            },
            { new: true })
            .lean<IInsurrance>()
            .exec();
            return insurrance;
      }

      public async deleteInsurrance(id: string): Promise<void> {
        const insurrance = await Insurrance.findById(id)
          .lean<IInsurrance>()
          .exec();
        if (!insurrance) throw createError('Record does not exist', 404);
        await Insurrance.findByIdAndDelete(id).exec();
      }

      public async getInsurrance(user: String): Promise<IInsurrance> {
        
        let insurrance = await Insurrance.find({ user: user })
          .lean<IInsurrance>()
          .exec();
        if (!insurrance) throw createError('user does not have any blood pressure record', 400);
        return insurrance;
      }

}
