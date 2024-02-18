import { Router } from 'express';
import { WalletService } from '../../services/shared/walletService';
import { reqAsAny } from '../../utils/utils';
import { sendError, sendResponse } from '../../utils/response';

export const walletRoute = Router();

walletRoute.get('/', (req, res, next) => {
  return new WalletService()
    .getUserWallet(reqAsAny(req).query._userId)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
