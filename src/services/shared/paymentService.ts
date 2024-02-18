import { TransactionReason } from '../../models/enums/transactionReason';
import {
  IPaystackChargeResponse,
  IPaystackInitTransactionResponse,
} from '../../models/interfaces/chargeResponses';
import { PaystackService } from './paystackService';
import { createError } from '../../utils/response';
import { UserRole } from '../../models/enums/userRole';
import { TransactionReferenceService } from './transactionReferenceService';
import { PaystackChargeStatus } from '../../models/enums/paymentData';
import { SubscriptionService } from './subscriptionService';
import { UserSubscriptionService } from './userSubscriptionService';
import { WalletService } from './walletService';

export class PaymentService {
  public async initTransaction(
    userId: string,
    body: {
      amount: number;
      itemId: string;
      reason: TransactionReason;
      inline?: boolean;
      callbackUrl?: string;
    }
  ): Promise<IPaystackInitTransactionResponse> {
    if (!body.reason) throw createError('Transaction reason is required', 400);
    const role = UserRole.PATIENT;
    console.log('>>> Initialising payment: ', body);
    let itemId: string, amount: number;
    switch (body.reason) {
      case TransactionReason.PLAN_PAYMENT:
        if (!body.itemId) throw createError('Item id is required', 400);
        const subscription = await new SubscriptionService().getSubscription(
          body.itemId
        );
        itemId = body.itemId;
        amount = subscription.price.amount;
        break;
      case TransactionReason.WALLET_FUNDING:
        if (!body.itemId) throw createError('Item id is required', 400);
        if (!body.amount) throw createError('Amount is required', 400);
        const wallet = await new WalletService().getUserWallet(body.itemId);
        itemId = body.itemId;
        amount = body.amount;
    }
    return await new PaystackService().initializeTransaction(
      userId,
      amount,
      itemId,
      role,
      body.reason,
      body.callbackUrl
    );
  }

  public async checkStatus(
    reference: string
  ): Promise<IPaystackChargeResponse> {
    if (!reference) throw createError('Reference is required', 400);
    return await new PaystackService().chargeCheckPending(reference);
  }

  // private static standardisePaymentResponse(response: IPaystackInitTransactionResponse): IStandardizedInitTransactionResponse {
  //     const paystackInitResponse = response as IPaystackInitTransactionResponse;
  //     return {
  //         authorization_url: paystackInitResponse.data.authorization_url,
  //         reference: paystackInitResponse.data.reference
  //     }
  //
  // }
  //
  // private static standardiseChargeResponse(response: IPaystackChargeResponse ): IStandardisedChargeResponse {
  //     console.log('Paystack response: ', response)
  //     return {
  //         amount: response.data.amount,
  //         currency: response.data.currency,
  //         reference: response.data.reference,
  //         message: response.data.message,
  //         status: response.data.status
  //     }
  // }

  public static async checkTransactionApproved(
    response: IPaystackChargeResponse
  ): Promise<{ message: string }> {
    const data = response.data;
    console.log('Verifying transaction: ', response);
    const transactionReferenceService = new TransactionReferenceService();
    const transactionReference =
      await transactionReferenceService.getTransactionReference(data.reference);
    const amount = transactionReference.amount;
    if (transactionReference.used) {
      console.warn('>>>>>>>Transaction reference already used');
      return {
        message: `Payment for ${transactionReference.reason} already processed`,
      };
    }
    if (data.status.toLowerCase() === PaystackChargeStatus.SUCCESS) {
      switch (transactionReference.reason) {
        case TransactionReason.PLAN_PAYMENT:
          await transactionReferenceService.markReferenceUsed(
            data.reference,
            true
          );
          await new UserSubscriptionService().assignSubscription(
            transactionReference.userId,
            transactionReference.itemId,
            true
          );
          break;
        case TransactionReason.WALLET_FUNDING:
          await transactionReferenceService.markReferenceUsed(
            data.reference,
            true
          );
          await new WalletService().fundWallet(
            transactionReference.itemId,
            transactionReference.amount
          );
          break;
      }
    }
    return {
      message: `${transactionReference.reason} payment processed`,
    };
  }
}
