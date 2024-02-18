import { MenstralCycleEnum } from "../../models/enums/periodTrackerEnum";
import { IPeriodTracker, PeriodTracker } from "../../models/periodTracker";
import { createError } from "../../utils/response";


export class PeriodTrackerService {
    public async createPeriodTracker(body: IPeriodTracker): Promise<IPeriodTracker> {
        if (!body.cycleVaries) throw createError('cycle variation information is required', 400);
        if (!body.disconfortReason) throw createError('disconfort Reason is required', 400);
        let periodTracker = await PeriodTracker.findOne({ user: body.user })
          .lean<IPeriodTracker>()
          .exec();
        if (periodTracker) return periodTracker;
        
        return await new PeriodTracker(body).save();
      }

      public async updatePeriodTracker(id: String, body: IPeriodTracker): Promise<IPeriodTracker> {
        
        let periodTracker = await PeriodTracker.findByIdAndUpdate(
            id,
            {
              $set: {
                cycleVaries: body.cycleVaries,
                disconfortReason: body.disconfortReason,
                reproductiveHealthDisorder: body.reproductiveHealthDisorder,
                lastPeriodStart:body.lastPeriodStart,
                newPeriodStart: body.newPeriodStart
              },
            },
            { new: true })
            .lean<IPeriodTracker>()
            .exec();
            return periodTracker;
      }

      public async getNextPosibleVisitation(user: String): Promise<Date[]> {
        
        let periodTracker = await PeriodTracker.findOne({ user: user })
          .lean<IPeriodTracker>()
          .exec();
        if (!periodTracker) throw createError('user has not entered her tracking information', 400);
        let menstralCycle = periodTracker.cycleVaries === MenstralCycleEnum.My_cycle_is_regular || periodTracker.cycleVaries === MenstralCycleEnum.I_dont_know? 28: 30;
        const posibleDates = await this._get5PossibleMenstrualDates(periodTracker.lastPeriodStart, menstralCycle)
        return posibleDates;
      }



       async _get5PossibleMenstrualDates(lastMenstrualPeriod: Date, cycleLength: number): Promise<Date[]> {
        // Create an array to store the 5 possible menstrual dates.
        const possibleMenstrualDates: Date[] = [];
      
        // Calculate the next menstrual period using the calculateNextMenstrualPeriod() function.
        const nextMenstrualPeriod = this._calculateNextMenstrualPeriod(lastMenstrualPeriod, cycleLength);
      
        // Add the next menstrual period to the array of possible menstrual dates.
        possibleMenstrualDates.push(nextMenstrualPeriod);
      
        // Calculate the 4 days before and after the next menstrual period.
        for (let i = 0; i < 4; i++) {
          const possibleMenstrualDate = new Date(nextMenstrualPeriod.getTime());
          possibleMenstrualDate.setDate(possibleMenstrualDate.getDate() - 2 + i);
          possibleMenstrualDates.push(possibleMenstrualDate);
        }
      
        // Return the array of 5 possible menstrual dates.
        return possibleMenstrualDates;
      }

       _calculateNextMenstrualPeriod(lastMenstrualPeriod: Date, cycleLength: number): Date {
        // Create a Date object for the next menstrual period.
        const nextMenstrualPeriod = new Date(lastMenstrualPeriod.getTime());
      
        // Add the cycle length to the next menstrual period.
        nextMenstrualPeriod.setDate(nextMenstrualPeriod.getDate() + cycleLength);
      
        // Return the next menstrual period.
        return nextMenstrualPeriod;
      }

}
