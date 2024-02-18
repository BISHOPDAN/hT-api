
import {  BloodTest, IBloodTest } from "../../models/medicalRecord/bloodTest";
import { createError } from "../../utils/response";


export class BloodTestService {
    public async createBloodTest(body: IBloodTest): Promise<IBloodTest> {
        if (!body.bloodType) throw createError('bloodType is required', 400);
        if (!body.genotype) throw createError('genotype is required', 400);
        let bloodTest = await BloodTest.findOne({ user: body.user })
          .lean<IBloodTest>()
          .exec();
        if (bloodTest) return bloodTest;
        
        return await new BloodTest(body).save();
      }

      public async updateBloodTest(id: String, body: IBloodTest): Promise<IBloodTest> {
        
        let bloodTest = await BloodTest.findByIdAndUpdate(
            id,
            {
              $set: {
                bloodType: body.bloodType,
                genotype: body.genotype,
              },
            },
            { new: true })
            .lean<IBloodTest>()
            .exec();
            return bloodTest;
      }

      public async deleteBloodTest(id: string): Promise<void> {
        const bloodTest = await BloodTest.findById(id)
          .lean<IBloodTest>()
          .exec();
        if (!bloodTest) throw createError('Record does not exist', 404);
        await BloodTest.findByIdAndDelete(id).exec();
      }

      public async getBloodTest(user: String): Promise<IBloodTest> {
        
        let bloodTest = await BloodTest.find({ user: user })
          .lean<IBloodTest>()
          .exec();
        if (!bloodTest) throw createError('user does not have any blood pressure record', 400);
        return bloodTest;
      }

}
