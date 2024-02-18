import { priceDef } from './priceDef';
import { PractitionerType } from '../enums/practitionerType';
import { SubscriptionSchedule } from '../enums/subscriptionSchedule';

export const subscriptionDef = {
  name: { type: String, required: true },
  trial: { type: Boolean, default: false },
  price: priceDef,
  practitionerType: {
    type: String,
    required: true,
    enum: Object.values(PractitionerType),
  },
  schedule: {
    type: String,
    required: true,
    enum: Object.values(SubscriptionSchedule),
  },
  benefits: { type: [String], required: true },
};
