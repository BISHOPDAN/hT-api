import { UserRole } from '../models/enums/userRole';
import { FilterQuery, QueryOptions } from 'mongoose';
import * as util from 'util';
import { IUser } from '../models/user';

export const userAsString = (
  user: string | IUser
): string | undefined | null => {
  return typeof user === 'string' ? user : user._id?.toString();
};

export const reqAsAny = (req: any): any => {
  return req;
};

export const normalizePhone = (phone: string, userId?: string): string => {
  if (!phone || phone.startsWith('+')) return phone;
  phone = phone.startsWith('0') ? phone.substr(1) : phone;
  phone = '+234' + phone.trim().replace(/\s/g, '');

  return phone;
};

export const normalizeEmail = (email: string) => {
  return email.toLowerCase();
};

export const isEmailValid = (email?: string): boolean => {
  if (!email) return false;
  const regExp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regExp.test(email);
};

export const isPhoneNumberValid = (phone?: string): boolean => {
  if (!phone) return false;
  // const regExp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  return true;
};

export const isNameValid = (name?: string): boolean => {
  if (!name) return false;
  if (name.length < 2 || name.length > 50) return false;
  const regExp = /^[a-zA-Z0-9]+$/;
  return regExp.test(name);
};

export const isUsernameValid = (username?: string): boolean => {
  if (!username) return false;
  if (username.length < 4 || username.length > 10) return false;
  const regExp = /^[a-zA-Z0-9.]+$/;
  return regExp.test(username);
};

export const isPasswordValid = (password?: string): boolean => {
  if (!password) return false;
  return password.length >= 8;
};

export const stripUpdateFields = <T>(...models: any[]): void => {
  models.forEach((_model) => {
    if (_model) {
      delete _model._id;
      delete _model.createdAt;
      delete _model.updatedAt;
    }
  });
};

export const getUpdateOptions = (): QueryOptions => {
  return {
    runValidators: true,
    setDefaultsOnInsert: true,
    upsert: true,
    new: true,
  };
};

export const roundToNearestMultiple = (
  value: number,
  multiple: number
): number => {
  return Math.ceil(value / multiple) * multiple;
};

export const capitalize = (input) => {
  if (!input || input.length === 0) return '';
  const firstChar = input.charAt(0).toUpperCase();
  const otherChars = input.substring(1);
  return firstChar + otherChars;
};

export const switchRole = (role: UserRole): UserRole => {
  if (role === UserRole.DOCTOR) return UserRole.PATIENT;
  else return UserRole.DOCTOR;
};

export const buildPaginationOptions = (
  filter: FilterQuery<any> = {},
  paginatedField: string,
  req: {
    sortAscending?: boolean;
    query?: {
      query?: string;
      limit?: string;
      sortAscending?: boolean;
      nextPage?: string;
      previousPage?: string;
    };
  }
) => {
  const paginateOptions = {
    paginatedField,
    query: filter,
    limit: isNaN(Number(req.query.limit)) ? 10 : req.query.limit,
    sortAscending: req.query.sortAscending || req.sortAscending || false,
  };
  if (req.query.nextPage)
    Object.assign(paginateOptions, { next: req.query.nextPage });
  else if (req.query.previousPage)
    Object.assign(paginateOptions, { previous: req.query.previousPage });
  console.log(
    '>>> Paginate options built: ',
    util.inspect(paginateOptions, true, 10, true)
  );
  return paginateOptions;
};
