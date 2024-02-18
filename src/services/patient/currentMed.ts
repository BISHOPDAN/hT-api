
import { CurrentMed, ICurrentMed } from "../../models/medicalRecord/currentMedication";
import { createError } from "../../utils/response";


export class CurrentMedService {
    public async createCurrentMed(body: ICurrentMed): Promise<ICurrentMed> {
        if (!body.name) throw createError('name of medication is required', 400);
        if (!body.dossage) throw createError('dossage is required', 400);
        if (!body.frequency) throw createError('frequency is required', 400);
        if (!body.medicationType) throw createError('select either its current or past medication. This is required', 400);
        let currentMed = await CurrentMed.findOne({ user: body.user })
          .lean<ICurrentMed>()
          .exec();
        if (currentMed) return currentMed;
        
        return await new CurrentMed(body).save();
      }

      public async updateCurrentMed(id: String, body: ICurrentMed): Promise<ICurrentMed> {
        
        let currentMed = await CurrentMed.findByIdAndUpdate(
            id,
            {
              $set: {
                name: body.name,
                dossage: body.dossage,
                frequency: body.frequency
              },
            },
            { new: true })
            .lean<ICurrentMed>()
            .exec();
            return currentMed;
      }

      public async deleteCurrentMed(id: string): Promise<void> {
        const currentMed = await CurrentMed.findById(id)
          .lean<ICurrentMed>()
          .exec();
        if (!currentMed) throw createError('Record does not exist', 404);
        await CurrentMed.findByIdAndDelete(id).exec();
      }

      public async getCurrentMed(user: String): Promise<ICurrentMed> {
        
        let currentMed = await CurrentMed.find({ user: user })
          .lean<ICurrentMed>()
          .exec();
        if (!currentMed) throw createError('user does not have any blood pressure record', 400);
        return currentMed;
      }

}
