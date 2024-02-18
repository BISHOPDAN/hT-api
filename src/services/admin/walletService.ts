import { IWallet, Wallet } from '../../models/wallet';
//import { buildPaginationOptions } from '../../utils/utils';


export class WalletService {
  public async getWallets(_): Promise<IWallet[]> {
    const wallets = await Wallet.find().lean<IWallet[]>().exec();
    return wallets;
  }
}