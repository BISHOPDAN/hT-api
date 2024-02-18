import { WalletService } from '../../services/admin/walletService';
import { sendError, sendResponse } from '../../utils/response';
import { Router } from 'express';

export const walletRoute = Router();

walletRoute.get('/', async (req, res, next) => {
  new WalletService()
    .getWallets(req)
    .then((result) => {
      sendResponse(res, 200, result);
    })
    .catch((err) => {
      sendError(err, next);
    });
});
