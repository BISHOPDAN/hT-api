import { TransactionType } from './enums/transactionType';
import { UserRole } from './enums/userRole';
import { model, Model, Schema } from 'mongoose';
import { IUser } from './user';
import { IBaseDocument } from './interfaces/baseInterface';
import { PaymentMethodType } from './enums/paymentMethod';

export interface ITransaction extends IBaseDocument {
  user: string | IUser;
  type: TransactionType;
  role: UserRole;
  paymentType: PaymentMethodType;
  itemId: string;
  amount: number;
  description: string;
}

const transactionReferenceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    type: { type: String, required: true },
    role: { type: String, required: false },
    paymentType: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const Transaction: Model<ITransaction> = model<ITransaction>(
  'transaction',
  transactionReferenceSchema
);
