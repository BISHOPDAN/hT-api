import { IWallet, Wallet } from '../../models/wallet';
import { getUpdateOptions } from '../../utils/utils';

export class WalletService {
  public async createWallet(userId: string): Promise<IWallet> {
    return await Wallet.findOneAndUpdate(
      { userId },
      {
        balance: 0,
        currency: 'NGN',
      },
      getUpdateOptions()
    ).exec();
  }

  public async getUserWallet(userId: string): Promise<IWallet> {
    let wallet = await Wallet.findOne({ userId }).lean<IWallet>().exec();
    if (!wallet) return await this.createWallet(userId);
    return wallet;
  }

  public async fundWallet(userId: string, amount: number): Promise<IWallet> {
    const wallet = await this.getUserWallet(userId);
    return await Wallet.findByIdAndUpdate(wallet._id, {
      $inc: { balance: amount },
    }).exec();
  }
}
