import { IBaseDocument } from './interfaces/baseInterface';
import { IPrice } from './interfaces/price';
import { PractitionerType } from './enums/practitionerType';
import { model, Model, Schema } from 'mongoose';
import { subscriptionDef } from './definitions/subscriptionDef';
import { SubscriptionSchedule } from './enums/subscriptionSchedule';

export interface ISubscription extends IBaseDocument {
  name: string;
  trial: boolean;
  price: IPrice;
  practitionerType: PractitionerType;
  schedule: SubscriptionSchedule;
  benefits: string[];
}

const subscriptionSchema = new Schema(subscriptionDef, { timestamps: true });

export const Subscription: Model<ISubscription> = model<ISubscription>(
  'subscription',
  subscriptionSchema
);
