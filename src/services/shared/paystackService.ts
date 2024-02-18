import {
  IPaystackChargeResponse,
  IPaystackInitTransactionResponse,
} from '../../models/interfaces/chargeResponses';
import { config } from '../../config/config';
import { createError } from '../../utils/response';
import { IUser } from '../../models/user';
import { TransactionReason } from '../../models/enums/transactionReason';
import { UserRole } from '../../models/enums/userRole';
import { PaymentService } from './paymentService';
import { ProfileService } from './profileService';
import { TransactionReferenceService } from './transactionReferenceService';
import { PaystackRoute } from '../../models/enums/paystackRoute';
import request from 'request-promise';

export class PaystackService {
  public async initializeTransaction(
    userId: string,
    amount: number,
    itemId: string,
    role: UserRole,
    reason: TransactionReason,
    callbackUrl?: string
  ): Promise<IPaystackInitTransactionResponse> {
    const user: IUser = await new ProfileService().getProfile(userId);
    const reference = (
      await new TransactionReferenceService().addTransactionReference(
        userId,
        amount,
        role,
        reason,
        itemId
      )
    ).reference;
    callbackUrl = callbackUrl || config.paystackCallbackUrl;
    return request(
      PaystackService.createUrl(PaystackRoute.INITIALIZE_TRANSACTION),
      {
        body: {
          email: user.email,
          reference: reference,
          amount: amount * 100,
          callback_url: callbackUrl,
        },
        method: 'POST',
        json: true,
        headers: PaystackService.getHeaders(),
      }
    ).catch((err) => {
      throw PaystackService.handleError(err);
    });
  }

  public async chargeCheckPending(
    reference: string
  ): Promise<IPaystackChargeResponse> {
    const paystackChargeResponse: IPaystackChargeResponse = await request(
      PaystackService.createUrl(PaystackRoute.CHARGE, reference),
      {
        method: 'GET',
        json: true,
        headers: PaystackService.getHeaders(),
      }
    ).catch((err) => {
      throw PaystackService.handleError(err);
    });
    const transactionCheckResult =
      await PaymentService.checkTransactionApproved(paystackChargeResponse);
    return Object.assign(paystackChargeResponse, {
      info: transactionCheckResult,
    });
  }

  // noinspection JSMethodCanBeStatic
  // private async checkTransactionApproved(response: IPaystackChargeResponse) {
  //     const data = response.data;
  //     const amount = response.data.amount / 100;
  //     console.log('Verifying transaction: ', response);
  //     const transactionReferenceService = new TransactionReferenceService();
  //     const transactionReference = await transactionReferenceService.getTransactionReference(data.reference);
  //     if (transactionReference.used) return console.warn('>>>>>>>Transaction reference already used');
  //     if (data.status === PaystackChargeStatus.SUCCESS) {
  //         if (transactionReference.saveCard) {
  //             const authorization = data.authorization;
  //             await new CardService().saveCard(transactionReference.userId, transactionReference.role, authorization.bin, authorization.last4, authorization.brand,
  //                 authorization.exp_month, authorization.exp_year, authorization.authorization_code, authorization.signature, authorization.reusable);
  //         }
  //         switch (transactionReference.reason) {
  //             case TransactionReason.WALLET_FUNDING:
  //                 await new WalletService().giveValue(transactionReference.userId, transactionReference.role, amount, null, transactionReference.property);
  //                 await transactionReferenceService.markReferenceUsed(data.reference, true);
  //                 break;
  //             case TransactionReason.CARD_ADDING:
  //                 await transactionReferenceService.markReferenceUsed(data.reference, true);
  //                 break;
  //         }
  //     }
  // }

  private static handleError(err) {
    const error = err.error;
    console.error('**** Original Paystack Error message: ', err.message);
    if (!error) throw createError('Payment failed', 500);
    if (!error.data)
      throw createError(error.message ? error.message : 'Payment failed', 400);
    const data = error.data;
    throw createError(data.message, 400);
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${config.paystackAuthorization}`,
      Accept: 'application/json',
    };
  }

  public static createUrl(route: PaystackRoute, path?: string): string {
    if (path && !path.startsWith('/')) path = `/${path}`;
    let url = `https://api.paystack.co/${route}`;
    if (path) url = url.concat(path);
    console.log('Calling paystack: ', url);
    return url;
  }
}
