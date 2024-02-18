
import { fitnessCategory, fitnessPackage } from "../../models/enums/fitnessCategory";
import { Status } from "../../models/enums/generalEnum";
import { Fitness, IFitness } from "../../models/fitness";
import { IUserFitness, UserFitness } from "../../models/userFitness";
import { createError } from "../../utils/response";


export class FitnessService {
    public async createFit(body: IFitness): Promise<IFitness> {
        
        let fitness = await Fitness.findOne({ name: body.name, focus:body.focus })
          .lean<IFitness>()
          .exec();
        if (fitness) throw createError('Fitness already exist', 400);
        return await new Fitness(body).save();
      }


      public async getFitnessByPackage(fitPackage:fitnessPackage ){
       
        let fitnesses = await Fitness.find({ package: fitPackage, status: Status.Active})
          .lean<IFitness>()
          .exec();
          return fitnesses
      }
      public async getFitness(){
       
        let fitnesses = await Fitness.find({ status: Status.Active})
          .lean<IFitness>()
          .exec();
          return fitnesses
      }

      public async getFitnessByCategory(fitCat:fitnessCategory ){
       
        let fitnesses = await Fitness.find({ category: fitCat, status: Status.Active})
          .lean<IFitness>()
          .exec();
          return fitnesses
      }

      public async getFitnessByPackageCategory(fitCat:fitnessCategory, fitPack:fitnessPackage ){
       
        let fitnesses = await Fitness.find({ category: fitCat, package:fitPack, status: Status.Active})
          .lean<IFitness>()
          .exec();
          return fitnesses
      }
      public async updateFitness(id: String, body: IFitness): Promise<IFitness> {
        
        let question = await Fitness.findByIdAndUpdate(
            id,
            {
              $set: {
                name: body.name,
                focus: body.focus,
                description: body.description,
                number_of_count: body.number_of_count,
                number_of_rep: body.number_of_rep,
                category: body.category,
                imageUrl:body.imageUrl,
                package: body.package,
                status: body.status,
                
              },
            },
            { new: true })
            .lean<IFitness>()
            .exec();
            return question;
      }

      public async createUserFit(body: IUserFitness): Promise<IUserFitness> {
        
        let fitness = await UserFitness.findOne({ fitnessPackage: body.fitnessPackage, user:body.user })
          .lean<IUserFitness>()
          .exec();
        if (fitness) throw createError('Fitness already exist', 400);
        return await new UserFitness(body).save();
      }

      public async updateUserFitness(id: String, body: IUserFitness): Promise<IUserFitness> {
        
        let userFitness = await UserFitness.findByIdAndUpdate(
            id,
            {
              $set: {
                fitnessPackage: body.fitnessPackage,
                amountPaid: body.amountPaid,
                gender: body.gender,
                focusArea: body.focusArea,
                existingHealthCondition: body.existingHealthCondition,
                injury: body.injury,
                chestPain: body.chestPain,
                heartCondition: body.heartCondition,
                medication: body.medication,
                doubtOboutHealth: body.doubtOboutHealth,
                dayPerweek: body.dayPerweek,
                startDate: body.startDate,
                
              },
            },
            { new: true })
            .lean<IUserFitness>()
            .exec();
            return userFitness;
      }

}
