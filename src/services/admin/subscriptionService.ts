import { FilterQuery } from 'mongoose';
import { IPrice } from '../../models/interfaces/price';
import { ISubscription, Subscription } from '../../models/subscription';
import { createError } from '../../utils/response';
import { IUserSubscription } from '../../models/userSubscription';
import { UserSubscriptionService } from '../shared/userSubscriptionService';
import { SubscriptionSchedule } from '../../models/enums/subscriptionSchedule';
import { getUpdateOptions, stripUpdateFields } from '../../utils/utils';

export class SubscriptionService {
  public async getSubscriptions(req): Promise<ISubscription[]> {
    const practitionerType = req.query.practitionerType;
    const filter: FilterQuery<ISubscription> = {};
    if (practitionerType) {
      filter.practitionerType = practitionerType;
    }
    return await Subscription.find(filter).lean<ISubscription[]>().exec();
  }

  public async createSubscription(
    body: ISubscription & { benefits: string }
  ): Promise<ISubscription> {
    if (!body.name) throw createError('Name is required', 400);
    if (!body.practitionerType)
      throw createError('Practitioner type is required', 400);
    if (!body.schedule) throw createError('Schedule is required', 400);
    if (!Object.values(SubscriptionSchedule).includes(body.schedule))
      throw createError(
        `Invalid schedule. Valid schedules are ${Object.values(
          SubscriptionSchedule
        ).join(', ')}`
      );
    if (!body.price?.amount) throw createError('Price amount is required', 400);
    body.price.currency = 'NGN';
    body.price.previousAmount = body.price.previousAmount || body.price.amount;
    if (!body.benefits || typeof body.benefits !== 'string')
      throw createError('Valid benefits string required', 400);
    (body as any).benefits = body.benefits
      .split(',')
      .map((benefit) => benefit.trim());
    stripUpdateFields(body);
    return await Subscription.findOneAndUpdate(
      {
        practitionerType: body.practitionerType,
        schedule: body.schedule,
      },
      body,
      getUpdateOptions()
    )
      .lean<ISubscription>()
      .exec();
  }

  public async updateSubscription(id: string, dto: Partial<ISubscription>) {
    const _sub: ISubscription = await Subscription.findById(id)
      .lean<ISubscription>()
      .exec();
    if (!_sub) throw createError('Subscription not found', 404);

    if (!!dto?.price?.amount && _sub?.price?.amount === dto?.price?.amount)
      throw createError('Amount cannot be same as the previous.');

    const newPrice: IPrice = {
      amount: dto?.price?.amount ?? _sub?.price?.amount,
      currency: dto?.price?.currency ?? _sub?.price?.currency,
      previousAmount: !!dto?.price?.amount
        ? _sub?.price?.amount
        : _sub?.price?.previousAmount,
    };
    if (dto.benefits && typeof dto.benefits === 'string') {
      dto.benefits = (dto.benefits as string)
        .split(',')
        .map((benefit) => benefit.trim());
    }

    return await Subscription.findByIdAndUpdate(
      id,
      {
        ...dto,
        price: newPrice,
      },
      { new: true }
    )
      .lean<ISubscription>()
      .exec();
  }

  public async deleteSubscription(id: string): Promise<ISubscription> {
    const subscription = await Subscription.findById(id)
      .lean<ISubscription>()
      .exec();
    if (!subscription) throw createError('Subscription does not exist', 404);
    await Subscription.findByIdAndDelete(id).exec();
    return subscription;
  }

  public async assignSubscription(
    user: string,
    planId: string
  ): Promise<IUserSubscription> {
    return new UserSubscriptionService().assignSubscription(user, planId, true);
  }
}
