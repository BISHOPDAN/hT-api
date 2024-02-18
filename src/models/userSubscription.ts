import { IUser } from './user';
import { ISubscription } from './subscription';
import { model, Model, Schema } from 'mongoose';
import { subscriptionDef } from './definitions/subscriptionDef';

export interface IUserSubscription extends ISubscription {
  user: string | IUser;
  subscription: string | ISubscription;
  validUntil: Date;
  usageCount: number;
}

const userSubscriptionSchema = new Schema(
  Object.assign(subscriptionDef, {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'subscription',
      required: true,
    },
    validUntil: { type: Date, required: true },
    usageCount: { type: Number, default: 0 },
  }),
  { timestamps: true }
);

export const UserSubscription: Model<IUserSubscription> =
  model<IUserSubscription>('userSubscription', userSubscriptionSchema);
