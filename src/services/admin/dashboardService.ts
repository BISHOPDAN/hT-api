import {
  IAdminDashboardResult,
  IGenderDemographic,
  IGenderScore,
} from '../../models/interfaces/adminDashboardResult';
import { Appointment } from '../../models/appointment';
import { User } from '../../models/user';
import { UserRole } from '../../models/enums/userRole';
import moment from 'moment';
import {
  IUserSubscription,
  UserSubscription,
} from '../../models/userSubscription';
import { PractitionerType } from '../../models/enums/practitionerType';

export class DashboardService {
  public async loadDashboard(
    startDate?: string,
    endDate?: string,
    mapKey?: string
  ): Promise<IAdminDashboardResult> {
    const totalAppointments: number = await Appointment.countDocuments().exec();
    const totalPatients: number = await User.countDocuments({
      roles: UserRole.PATIENT,
    }).exec();
    const totalDoctors: number = await User.countDocuments({
      roles: UserRole.DOCTOR,
    }).exec();
    const totalSubscriptionPayment = (
      await UserSubscription.find().lean<IUserSubscription[]>().exec()
    ).reduce((total: number, subscription: IUserSubscription) => {
      total += subscription.price.amount;
      return total;
    }, 0);
    const totalTherapistSubscriptionPayment = (
      await UserSubscription.find({
        practitionerType: PractitionerType.THERAPIST,
      })
        .lean<IUserSubscription[]>()
        .exec()
    ).reduce((total: number, subscription: IUserSubscription) => {
      total += subscription.price.amount;
      return total;
    }, 0);
    const totalDoctorSubscriptionPayment = (
      await UserSubscription.find({ practitionerType: PractitionerType.DOCTOR })
        .lean<IUserSubscription[]>()
        .exec()
    ).reduce((total: number, subscription: IUserSubscription) => {
      total += subscription.price.amount;
      return total;
    }, 0);
    const totalDermatologistSubscriptionPayment = (
      await UserSubscription.find({
        practitionerType: PractitionerType.DERMATOLOGIST,
      })
        .lean<IUserSubscription[]>()
        .exec()
    ).reduce((total: number, subscription: IUserSubscription) => {
      total += subscription.price.amount;
      return total;
    }, 0);
    const totalFitnessCoachSubscriptionPayment = (
      await UserSubscription.find({
        practitionerType: PractitionerType.FITNESS_COACH,
      })
        .lean<IUserSubscription[]>()
        .exec()
    ).reduce((total: number, subscription: IUserSubscription) => {
      total += subscription.price.amount;
      return total;
    }, 0);
    const totalFreeTrialSubscriptionPayment = (
      await UserSubscription.find({ name: 'Free trial' })
        .lean<IUserSubscription[]>()
        .exec()
    ).reduce((total: number, subscription: IUserSubscription) => {
      total += subscription.price.amount;
      return total;
    }, 0);
    const totalPatientsForPeriod: number =
      startDate && endDate
        ? await User.countDocuments({
            roles: UserRole.PATIENT,
            $and: [
              {
                createdAt: {
                  $gte: moment(startDate, 'YYYY-MM-DD', true).toDate(),
                },
              },
              { createdAt: { $lte: moment(endDate, 'YYYY-MM-DD', true) } },
            ],
          })
        : await User.countDocuments({ roles: UserRole.PATIENT });
    const genderDemoGraphic: IGenderDemographic[] =
      await this.getGenderDemoGraphic(null, null, mapKey);
    const customGenderDemoGraphic: IGenderDemographic[] =
      startDate && endDate
        ? await this.getGenderDemoGraphic(startDate, endDate, mapKey)
        : undefined;
    return {
      totalAppointments,
      totalPatients,
      totalDoctors,
      totalPatientsForPeriod,
      genderDemoGraphic,
      totalSubscriptionPayment,
      totalTherapistSubscriptionPayment,
      totalFreeTrialSubscriptionPayment,
      totalDoctorSubscriptionPayment,
      totalDermatologistSubscriptionPayment,
      totalFitnessCoachSubscriptionPayment,
      customGenderDemoGraphic,
    };
  }

  private async getGenderDemoGraphic(
    startDate?: string,
    endDate?: string,
    mapKey: 'month' | 'dayOfWeek' | any = 'month'
  ): Promise<IGenderDemographic[]> {
    const userAggregation = User.aggregate();
    if (startDate && endDate) {
      const startDateMoment = moment(startDate, 'YYYY-MM-DD', true);
      const endDateMoment = moment(endDate, 'YYYY-MM-DD', true);
      userAggregation.match({
        $and: [
          { createdAt: { $gte: startDateMoment.toDate() } },
          { createdAt: { $lte: endDateMoment.toDate() } },
        ],
      });
    }
    userAggregation.project({
      firstName: '$firstName',
      gender: '$gender',
      createdAt: '$createdAt',
    });
    switch (mapKey) {
      case 'dayOfWeek':
        userAggregation.group({
          _id: { dayOfWeek: { $dayOfWeek: '$createdAt' }, gender: '$gender' },
          count: { $sum: 1 },
        });
        break;
      default:
        userAggregation.group({
          _id: { month: { $month: '$createdAt' }, gender: '$gender' },
          count: { $sum: 1 },
        });
        break;
    }
    const genderScores: IGenderScore[] = await userAggregation.exec();
    genderScores.forEach((result: any) => {
      result.gender = result._id.gender;
      result.month = result._id.month;
      result.dayOfWeek = result._id.dayOfWeek;
      delete result._id;
    });
    const genderDemographics: IGenderDemographic[] = [];
    const genderMap: Map<number, IGenderScore[]> = new Map<
      number,
      IGenderScore[]
    >();
    for (const score of genderScores) {
      const key = score.dayOfWeek || score.month;
      const existingScores = genderMap.get(key) || [];
      existingScores.push(score);
      genderMap.set(key, existingScores);
    }
    genderMap.forEach((value, key) => {
      console.log('>>> Map key: ', mapKey);
      const genderDemoGraphic: any = { genderScores: value };
      genderDemoGraphic[mapKey] = key;
      genderDemographics.push(genderDemoGraphic);
    });
    return genderDemographics;
  }
}
