
import { Allergy, IAllergy } from "../../models/medicalRecord/allergy";
import { createError } from "../../utils/response";


export class AllergyService {
    public async createAllergy(body: IAllergy): Promise<IAllergy> {
        if (!body.allergies) throw createError('allergies is required', 400);
        let allergies = await Allergy.findOne({ user: body.user })
          .lean<IAllergy>()
          .exec();
        if (allergies) return allergies;
        
        return await new Allergy(body).save();
      }

      public async updateAllergy(id: String, body: IAllergy): Promise<IAllergy> {
        
        let allergies = await Allergy.findByIdAndUpdate(
            id,
            {
              $set: {
                allergies: body.allergies,
              },
            },
            { new: true })
            .lean<IAllergy>()
            .exec();
            return allergies;
      }

      public async deleteAllergy(id: string): Promise<void> {
        const allergies = await Allergy.findById(id)
          .lean<IAllergy>()
          .exec();
        if (!allergies) throw createError('Record does not exist', 404);
        await Allergy.findByIdAndDelete(id).exec();
      }

      public async getAllergy(user: String): Promise<IAllergy> {
        
        let allergies = await Allergy.find({ user: user })
          .lean<IAllergy>()
          .exec();
        if (!allergies) throw createError('user does not have any blood pressure record', 400);
        return allergies;
      }

}
