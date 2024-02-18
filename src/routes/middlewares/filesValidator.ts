import { NextFunction, Request, Response } from 'express';
import { createError, ErrorStatus } from '../../utils/response';

export const filesValidationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('>>> Validating file: ', req);
  const files = req.files;
  if (!files || files.length === 0) {
    next(createError('Files required', 400, ErrorStatus.FAILED));
  }
  {
    next();
  }
};
