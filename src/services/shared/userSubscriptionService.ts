import { NotificationService } from './notificationService';
import { UserRole } from '../../models/enums/userRole';
import {
  NotificationGroup,
  NotificationStrategy,
  NotificationTag,
} from '../../models/notification';
import { ISubscription } from '../../models/subscription';
import { SubscriptionService } from './subscriptionService';
import {
  IUserSubscription,
  UserSubscription,
} from '../../models/userSubscription';
import { getUpdateOptions, stripUpdateFields } from '../../utils/utils';
import moment from 'moment';
import { createError, ErrorStatus } from '../../utils/response';
import { SubscriptionSchedule } from '../../models/enums/subscriptionSchedule';
import { PractitionerType } from '../../models/enums/practitionerType';

export class UserSubscriptionService {
  public async assignFreeTrialSubscription(user: string) {
    const subscription = await new SubscriptionService().getTrialSubscription();
    console.log('>>> Assigning free trial subscription to: ', user);
    if (!subscription)
      return console.warn('>>> Free trial subscription not found');
    await this.assignSubscription(user, subscription._id, false);
  }

  public async assignSubscription(
    user: string,
    planId: string,
    notify = false
  ) {
    const subscription: ISubscription =
      await new SubscriptionService().getSubscription(planId);
    stripUpdateFields(subscription);
    await UserSubscription.findOneAndUpdate(
      { user },
      Object.assign(subscription, {
        subscription: planId,
        usageCount: 0,
        validUntil: UserSubscriptionService.getExpirationDate(
          subscription.schedule
        ),
      }),
      getUpdateOptions()
    )
      .lean<IUserSubscription>()
      .exec();
    console.log(
      `Free trial subscription '${subscription.name}' assigned to ${user}`
    );
    if (notify) {
      await new NotificationService().sendNotification(
        {
          userId: user,
          title: `${subscription.name} plan active`,
          ticker: `${subscription.name} plan active`,
          content: `You have successfully subscribed to the ${subscription.name} ${subscription.practitionerType} plan`,
          itemId: subscription._id,
          role: UserRole.PATIENT,
          tag: NotificationTag.SUBSCRIPTION,
          group: NotificationGroup.SUBSCRIPTION,
        },
        NotificationStrategy.PUSH_ONLY,
        true
      );
    }
    return await this.getUserSubscription(user);
  }

  public async getUserSubscription(
    user: string,
    validate = true
  ): Promise<IUserSubscription> {
    const userSubscription: IUserSubscription = await UserSubscription.findOne({
      user,
    })
      .populate('subscription')
      .lean<IUserSubscription>()
      .exec();
    if (!userSubscription && validate)
      throw createError(
        'No subscription found for user',
        400,
        ErrorStatus.NO_SUBSCRIPTION
      );
    return userSubscription;
  }

  public async getUserSubscriptionForPractitionerType(
    user: string,
    practitionerType: PractitionerType,
    validate = true
  ): Promise<IUserSubscription> {
    const userSubscription: IUserSubscription = await UserSubscription.findOne({
      user,
      practitionerType,
    })
      .populate('subscription')
      .lean<IUserSubscription>()
      .exec();
    if (!userSubscription && validate)
      throw createError(
        `You don't have any ${practitionerType} subscription plan`,
        400,
        ErrorStatus.NO_SUBSCRIPTION
      );
    return userSubscription;
  }

  public async applySubscription(
    user: string,
    practitionerType: PractitionerType
  ) {
    // const userSubscription: IUserSubscription =
    //   await this.getUserSubscriptionForPractitionerType(user, practitionerType);
    const userSubscription: IUserSubscription = await this.getUserSubscription(
      user,
      true
    );
    const nowMoment = moment();
    const validateUntilMoment = moment(userSubscription.validUntil);
    console.log(`Now: ${nowMoment}, valid until: ${validateUntilMoment}`);
    if (userSubscription.schedule === SubscriptionSchedule.ONE_SHOT) {
      if (userSubscription.usageCount > 0)
        throw createError(
          'Subscription has been used up',
          400,
          ErrorStatus.NO_SUBSCRIPTION
        );
    } else {
      if (validateUntilMoment.isBefore(nowMoment))
        throw createError(
          'Subscription has expired',
          400,
          ErrorStatus.NO_SUBSCRIPTION
        );
    }
    await UserSubscription.updateOne(
      { user, practitionerType },
      { $inc: { usageCount: 1 } }
    ).exec();
  }

  public async checkHasActiveSubscription(user: string): Promise<boolean> {
    const userSubscription: IUserSubscription = await this.getUserSubscription(
      user,
      false
    );
    const nowMoment = moment();
    const validateUntilMoment = moment(userSubscription.validUntil);
    if (userSubscription.schedule === SubscriptionSchedule.ONE_SHOT) {
      if (userSubscription.usageCount > 0) return false;
    } else {
      if (validateUntilMoment.isBefore(nowMoment)) return false;
    }
    return true;
  }

  private static getExpirationDate(schedule: SubscriptionSchedule): Date {
    const now = moment();
    switch (schedule) {
      case SubscriptionSchedule.TRIAL:
        return now.clone().add(1, 'days').toDate();
      case SubscriptionSchedule.WEEKLY:
        return now.clone().add(1, 'week').toDate();
      case SubscriptionSchedule.MONTHLY:
        return now.clone().add(1, 'month').toDate();
      case SubscriptionSchedule.QUARTERLY:
        return now.clone().add(3, 'month').toDate();
      case SubscriptionSchedule.ANNUALLY:
        return now.clone().add(1, 'year').toDate();
      case SubscriptionSchedule.ONE_SHOT:
        return now.toDate();
      default:
        throw createError(
          `Unsupported subscription schedule '${schedule}'`,
          400
        );
    }
  }
}
