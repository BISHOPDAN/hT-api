import { NextFunction, Request, Response } from 'express';
import { createError, ErrorStatus } from '../../utils/response';

export const fileValidationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('>>> Validating file: ', req);
  const file = req.file;
  if (!file) {
    next(createError('File is required', 400, ErrorStatus.FAILED));
  }
  {
    next();
  }
};
