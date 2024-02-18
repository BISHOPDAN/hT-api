import { IBaseDocument } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';


export interface IWallet extends IBaseDocument {
    currency: string;
    balance: number;
    userId: string;
}


const walletSchema = new Schema({
    currency: { type: String, required: true },
    balance: { type: Number, required: true },
    userId: { type: String, required: true },
},{ timestamps: true });


export const Wallet: Model<IWallet> = model<IWallet>(
  'Wallet', walletSchema 
);