
import { ChronicCondition, IChronicCondition } from "../../models/medicalRecord/chronicCondition";
import { createError } from "../../utils/response";


export class ChronicConditionService {
    public async createChronicCondition(body: IChronicCondition): Promise<IChronicCondition> {
        if (!body.name) throw createError('name of medication is required', 400);
        if (!body.date) throw createError('date is required', 400);
        if (!body.user) throw createError('user is required', 400);
        let chronicCondition = await ChronicCondition.findOne({ user: body.user })
          .lean<IChronicCondition>()
          .exec();
        if (chronicCondition) return chronicCondition;
        
        return await new ChronicCondition(body).save();
      }

      public async updateChronicCondition(id: String, body: IChronicCondition): Promise<IChronicCondition> {
        
        let chronicCondition = await ChronicCondition.findByIdAndUpdate(
            id,
            {
              $set: {
                name: body.name,
                dossage: body.date,
              },
            },
            { new: true })
            .lean<IChronicCondition>()
            .exec();
            return chronicCondition;
      }

      public async deleteChronicCondition(id: string): Promise<void> {
        const chronicCondition = await ChronicCondition.findById(id)
          .lean<IChronicCondition>()
          .exec();
        if (!chronicCondition) throw createError('Record does not exist', 404);
        await ChronicCondition.findByIdAndDelete(id).exec();
      }

      public async getChronicCondition(user: String): Promise<IChronicCondition> {
        
        let chronicCondition = await ChronicCondition.find({ user: user })
          .lean<IChronicCondition>()
          .exec();
        if (!chronicCondition) throw createError('user does not have any blood pressure record', 400);
        return chronicCondition;
      }

}
