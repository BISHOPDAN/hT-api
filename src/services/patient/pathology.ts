
import { Pathology, IPathology } from "../../models/medicalRecord/pathology";
import { createError } from "../../utils/response";


export class PathologyService {
    public async createPathology(body: IPathology): Promise<IPathology> {
        if (!body.result) throw createError('result is required', 400);
        if (!body.title) throw createError('title is required', 400);
        let pathology = await Pathology.findOne({ user: body.user })
          .lean<IPathology>()
          .exec();
        if (pathology) return pathology;
        
        return await new Pathology(body).save();
      }

      public async updatePathology(id: String, body: IPathology): Promise<IPathology> {
        
        let pathology = await Pathology.findByIdAndUpdate(
            id,
            {
              $set: {
                result: body.result,
                title: body.title,
              },
            },
            { new: true })
            .lean<IPathology>()
            .exec();
            return pathology;
      }

      public async deletePathology(id: string): Promise<void> {
        const pathology = await Pathology.findById(id)
          .lean<IPathology>()
          .exec();
        if (!pathology) throw createError('Record does not exist', 404);
        await Pathology.findByIdAndDelete(id).exec();
      }

      public async getPathology(user: String): Promise<IPathology> {
        
        let pathology = await Pathology.find({ user: user })
          .lean<IPathology>()
          .exec();
        if (!Pathology) throw createError('user does not have any blood pressure record', 400);
        return pathology;
      }

}
