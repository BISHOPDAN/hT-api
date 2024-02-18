import { NextFunction, Response } from 'express';

const sendResponse = (
  res: Response,
  statusCode: number,
  result: any,
  message?: string
): void => {
  result = typeof result !== 'object' ? result?.toObject() : result;
  const responseObject: {
    status: ErrorStatus;
    statusCode: number;
    message?: string;
    data?: any;
  } = {
    statusCode: result?.statusCode || statusCode,
    status: ErrorStatus.SUCCESS,
    message: message,
    data: result,
  };
  res.header('Cache-Control', 'no-cache,no-supplier,must-revalidate');
  res.status(responseObject?.statusCode || statusCode || 200);
  res.json(responseObject);
  // console.log('Sending response\n::::\n:::\n::');
};

const sendError = (err: Error, next: NextFunction) => {
  const error: any = new Error(
    err ? err.message : 'A server error just occurred'
  );
  error.statusCode =
    err && (err as any).statusCode ? (err as any).statusCode : 500;
  error.status = (err as any).status || ErrorStatus.FAILED;
  next(error);
};

const createError = (
  message?: string,
  statusCode?: number,
  status?: ErrorStatus
): Error => {
  const error: any = new Error(message || 'An unknown error has occurred');
  error.statusCode = statusCode || 500;
  error.status = status || ErrorStatus.FAILED;
  return error;
};

const createStatusCodeError = (err, statusCode?: number): Error => {
  // console.error('Creating status code error: ', err);
  return createError(err.message, statusCode || err.statusCode);
  // if (err instanceof StatusCodeError)
  //     return createError(err.error.message, statusCode || err.error.statusCode);
  // else
  //     return createError(err.message, statusCode || err.statusCode);
};

export enum ErrorStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  EXISTING_ACCOUNT = 'existing_account',
  NO_SUBSCRIPTION = 'no_subscription',
}

export { sendResponse, sendError, createError, createStatusCodeError };
