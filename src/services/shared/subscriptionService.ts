import { ISubscription, Subscription } from '../../models/subscription';
import { PractitionerType } from '../../models/enums/practitionerType';
import { getUpdateOptions } from '../../utils/utils';
import { IPaystackInitTransactionResponse } from '../../models/interfaces/chargeResponses';
import { createError } from '../../utils/response';
import { PaymentService } from './paymentService';
import { TransactionReason } from '../../models/enums/transactionReason';
import { SubscriptionSchedule } from '../../models/enums/subscriptionSchedule';

export class SubscriptionService {
  public async getSubscriptionsPlans(
    group: string = 'false'
  ): Promise<ISubscription[] | IGroupedSubscriptionPlans[]> {
    console.log(`>>> Getting subscription plans. Group? ${group}`);
    if (group === 'true')
      return await SubscriptionService.getGroupedSubscriptionsPlans();
    else return await SubscriptionService.getSubscriptionPlans();
  }

  public async payForSubscription(
    user: string,
    id: string
  ): Promise<IPaystackInitTransactionResponse> {
    const subscription: ISubscription = await this.getSubscription(id);
    return await new PaymentService().initTransaction(user, {
      amount: subscription.price.amount,
      itemId: subscription._id,
      reason: TransactionReason.PLAN_PAYMENT,
    });
  }

  public async getSubscription(id: string): Promise<ISubscription> {
    const subscription = await Subscription.findById(id)
      .lean<ISubscription>()
      .exec();
    if (!subscription) throw createError('Subscription not found', 400);
    return subscription;
  }

  public async getTrialSubscription(): Promise<ISubscription | undefined> {
    return await Subscription.findOne({
      trial: true,
      schedule: SubscriptionSchedule.TRIAL,
    }).exec();
  }

  private static async getSubscriptionPlans(): Promise<ISubscription[]> {
    return await Subscription.find({ trial: false })
      .sort({ createdAt: 'asc' })
      .exec();
  }

  private static async getGroupedSubscriptionsPlans(): Promise<
    IGroupedSubscriptionPlans[]
  > {
    const groupedSubscriptions: IGroupedSubscriptionPlans[] = [];
    const subscriptions: ISubscription[] =
      await SubscriptionService.getSubscriptionPlans();
    const subscriptionsMap: Map<String, ISubscription[]> = new Map<
      String,
      ISubscription[]
    >();
    subscriptions.forEach((subscription) => {
      const subscriptions: ISubscription[] =
        subscriptionsMap.get(subscription.practitionerType) || [];
      subscriptions.push(subscription);
      subscriptionsMap.set(subscription.practitionerType, subscriptions);
    });
    subscriptionsMap.forEach((value, key) => {
      groupedSubscriptions.push({
        practitionerType: key,
        subscriptions: value,
      });
    });
    return groupedSubscriptions;
  }

  public static async createSubscriptions() {
    console.log('>>> Creating subscriptions');
    const benefitsString =
      'Free Aegle account, Access to handpicked doctors 24/7, Specialist and therapist on demand, Get prescriptions in minutes,' +
      'Medial and referral notes, Medical follow-ups, Add a family member less than 16 years, Access to our cutting-edge symptom checker, ' +
      'Access to our free digital health monitor, Daily suggestions to improve mental health, Mood journaling, Health lounge key pass access, ' +
      'Generous discount from our well-being partners';
    const benefits: string[] = benefitsString
      .split(',')
      .map((benefit) => benefit.trim());

    await this.saveSubscriptions(PractitionerType.DOCTOR, [
      {
        name: 'Free trial',
        trial: true,
        benefits,
        schedule: SubscriptionSchedule.TRIAL,
        price: {
          amount: 0,
          previousAmount: 0,
          currency: 'NGN',
        },
      },
      // {
      //   name: 'Billed monthly',
      //   benefits,
      //   schedule: SubscriptionSchedule.MONTHLY,
      //   price: {
      //     amount: 1500,
      //     previousAmount: 3000,
      //     currency: 'NGN',
      //   },
      // },
      // {
      //   name: 'Billed every 3 months',
      //   benefits,
      //   schedule: SubscriptionSchedule.QUARTERLY,
      //   price: {
      //     amount: 4000,
      //     previousAmount: 9000,
      //     currency: 'NGN',
      //   },
      // },
      // {
      //   name: 'Billed annually',
      //   benefits,
      //   schedule: SubscriptionSchedule.ANNUALLY,
      //   price: {
      //     amount: 14500,
      //     previousAmount: 36000,
      //     currency: 'NGN',
      //   },
      // },
    ] as ISubscription[]);
    // await this.saveSubscriptions(PractitionerType.THERAPIST, [
    //   {
    //     name: 'Billed monthly',
    //     benefits,
    //     schedule: SubscriptionSchedule.MONTHLY,
    //     price: {
    //       amount: 1500,
    //       previousAmount: 3000,
    //       currency: 'NGN',
    //     },
    //   },
    //   {
    //     name: 'Billed every 3 months',
    //     benefits,
    //     schedule: SubscriptionSchedule.QUARTERLY,
    //     price: {
    //       amount: 4000,
    //       previousAmount: 9000,
    //       currency: 'NGN',
    //     },
    //   },
    //   {
    //     name: 'Billed annually',
    //     benefits,
    //     schedule: SubscriptionSchedule.ANNUALLY,
    //     price: {
    //       amount: 14500,
    //       previousAmount: 16000,
    //       currency: 'NGN',
    //     },
    //   },
    // ] as ISubscription[]);
    // await this.saveSubscriptions(PractitionerType.DERMATOLOGIST, [
    //   {
    //     name: 'Billed monthly',
    //     benefits,
    //     schedule: SubscriptionSchedule.MONTHLY,
    //     price: {
    //       amount: 2500,
    //       previousAmount: 3500,
    //       currency: 'NGN',
    //     },
    //   },
    //   {
    //     name: 'Billed every 3 months',
    //     benefits,
    //     schedule: SubscriptionSchedule.QUARTERLY,
    //     price: {
    //       amount: 7000,
    //       previousAmount: 9000,
    //       currency: 'NGN',
    //     },
    //   },
    //   {
    //     name: 'Billed annually',
    //     benefits,
    //     schedule: SubscriptionSchedule.ANNUALLY,
    //     price: {
    //       amount: 25000,
    //       previousAmount: 30000,
    //       currency: 'NGN',
    //     },
    //   },
    // ] as ISubscription[]);
    // await this.saveSubscriptions(PractitionerType.FERTILITY_EXPERT, [
    //   {
    //     name: 'Billed monthly',
    //     benefits,
    //     schedule: SubscriptionSchedule.MONTHLY,
    //     price: {
    //       amount: 2500,
    //       previousAmount: 3500,
    //       currency: 'NGN',
    //     },
    //   },
    //   {
    //     name: 'Billed every 3 months',
    //     benefits,
    //     schedule: SubscriptionSchedule.QUARTERLY,
    //     price: {
    //       amount: 7000,
    //       previousAmount: 9000,
    //       currency: 'NGN',
    //     },
    //   },
    //   {
    //     name: 'Billed annually',
    //     benefits,
    //     schedule: SubscriptionSchedule.ANNUALLY,
    //     price: {
    //       amount: 25000,
    //       previousAmount: 30000,
    //       currency: 'NGN',
    //     },
    //   },
    // ] as ISubscription[]);
    // await this.saveSubscriptions(PractitionerType.FITNESS_COACH, [
    //   {
    //     name: 'Billed monthly',
    //     benefits,
    //     schedule: SubscriptionSchedule.MONTHLY,
    //     price: {
    //       amount: 1500,
    //       previousAmount: 3000,
    //       currency: 'NGN',
    //     },
    //   },
    //   {
    //     name: 'Billed every 3 months',
    //     benefits,
    //     schedule: SubscriptionSchedule.QUARTERLY,
    //     price: {
    //       amount: 4000,
    //       previousAmount: 6000,
    //       currency: 'NGN',
    //     },
    //   },
    //   {
    //     name: 'Billed annually',
    //     benefits,
    //     schedule: SubscriptionSchedule.ANNUALLY,
    //     price: {
    //       amount: 14500,
    //       previousAmount: 16000,
    //       currency: 'NGN',
    //     },
    //   },
    // ] as ISubscription[]);
    // await SubscriptionService.createDoctorPlans();
    // await SubscriptionService.createTherapistPlans();
    // await SubscriptionService.createDermatologistPlans();
    // await SubscriptionService.createFitnessCoachPlans();
  }

  private static async saveSubscriptions(
    practitionerType: PractitionerType,
    subscriptions: ISubscription[]
  ) {
    for (const subscription of subscriptions) {
      await Subscription.findOneAndUpdate(
        { practitionerType, schedule: subscription.schedule },
        subscription,
        getUpdateOptions()
      ).exec();
    }
  }

  private static async createDoctorPlans() {
    const benefitsString =
      'Free Aegle account, Access to handpicked doctors 24/7, Specialist and therapist on demand, Get prescriptions in minutes,' +
      'Medial and referral notes, Medical follow-ups, Add a family member less than 16 years, Access to our cutting-edge symptom checker, ' +
      'Access to our free digital health monitor, Daily suggestions to improve mental health, Mood journaling, Health lounge key pass access, ' +
      'Generous discount from our well-being partners';
    const benefits: string[] = benefitsString
      .split(',')
      .map((benefit) => benefit.trim());
    const practitionerType = PractitionerType.DOCTOR;
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.TRIAL },
      {
        name: 'Free trial',
        trial: true,
        benefits,
        price: {
          amount: 0,
          previousAmount: 0,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.MONTHLY },
      {
        name: 'Billed monthly',
        benefits,
        price: {
          amount: 1500,
          previousAmount: 3000,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.QUARTERLY },
      {
        name: 'Billed every 3 months',
        benefits,
        price: {
          amount: 4000,
          previousAmount: 9000,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.ANNUALLY },
      {
        name: 'Billed annually',
        benefits,
        price: {
          amount: 14500,
          previousAmount: 36000,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
  }

  private static async createTherapistPlans() {
    const benefitsString =
      'Free Aegle account, Access to handpicked doctors 24/7, Personalised consultation with a therapist, Get prescriptions in minutes,' +
      'Medial and referral notes, Medical follow-ups, Add a family member less than 16 years, Access to our cutting-edge symptom checker, ' +
      'Access to our free digital health monitor, Daily suggestions to improve mental health, Mood journaling, Health lounge key pass access, ' +
      'Generous discount from our well-being partners';
    const benefits: string[] = benefitsString
      .split(',')
      .map((benefit) => benefit.trim());
    const practitionerType = PractitionerType.THERAPIST;
    // await Subscription.findOneAndUpdate(
    //   { practitionerType, schedule: SubscriptionSchedule.ONE_SHOT },
    //   {
    //     name: 'One-off appointment',
    //     benefits,
    //     price: {
    //       amount: 5000,
    //       previousAmount: 7000,
    //       currency: 'NGN',
    //     },
    //   },
    //   getUpdateOptions()
    // ).exec();
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.MONTHLY },
      {
        name: 'Billed monthly',
        benefits,
        price: {
          amount: 1500,
          previousAmount: 3000,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.QUARTERLY },
      {
        name: 'Billed every 3 months',
        benefits,
        price: {
          amount: 4000,
          previousAmount: 9000,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.ANNUALLY },
      {
        name: 'Billed annually',
        benefits,
        price: {
          amount: 14500,
          previousAmount: 36000,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
  }

  private static async createDermatologistPlans() {
    const benefitsString =
      'Free Aegle account, Access to handpicked doctors 24/7, Personalised consultation with a therapist, Get prescriptions in minutes,' +
      'Medial and referral notes, Medical follow-ups, Add a family member less than 16 years, Access to our cutting-edge symptom checker, ' +
      'Access to our free digital health monitor, Daily suggestions to improve mental health, Mood journaling, Health lounge key pass access, ' +
      'Generous discount from our well-being partners';
    const benefits: string[] = benefitsString
      .split(',')
      .map((benefit) => benefit.trim());
    const practitionerType = PractitionerType.DERMATOLOGIST;
    // await Subscription.findOneAndUpdate(
    //   { practitionerType, schedule: SubscriptionSchedule.ONE_SHOT },
    //   {
    //     name: 'One-off appointment',
    //     benefits,
    //     price: {
    //       amount: 4000,
    //       previousAmount: 5000,
    //       currency: 'NGN',
    //     },
    //   },
    //   getUpdateOptions()
    // ).exec();
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.MONTHLY },
      {
        name: 'Billed monthly',
        benefits,
        price: {
          amount: 8000,
          previousAmount: 9500,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
  }

  private static async createFitnessCoachPlans() {
    const benefitsString =
      'Free Aegle account, Access to handpicked doctors 24/7, Personalised consultation with a therapist, Get prescriptions in minutes,' +
      'Medial and referral notes, Medical follow-ups, Add a family member less than 16 years, Access to our cutting-edge symptom checker, ' +
      'Access to our free digital health monitor, Daily suggestions to improve mental health, Mood journaling, Health lounge key pass access, ' +
      'Generous discount from our well-being partners';
    const benefits: string[] = benefitsString
      .split(',')
      .map((benefit) => benefit.trim());
    const practitionerType = PractitionerType.FITNESS_COACH;
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.ONE_SHOT },
      {
        name: 'One-off appointment',
        benefits,
        price: {
          amount: 4000,
          previousAmount: 5000,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
    await Subscription.findOneAndUpdate(
      { practitionerType, schedule: SubscriptionSchedule.MONTHLY },
      {
        name: 'Billed monthly',
        benefits,
        price: {
          amount: 8000,
          previousAmount: 9500,
          currency: 'NGN',
        },
      },
      getUpdateOptions()
    ).exec();
  }
}

export interface IGroupedSubscriptionPlans {
  practitionerType: String;
  subscriptions: ISubscription[];
}
