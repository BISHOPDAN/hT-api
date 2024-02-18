import { IUser } from '../models/user';
import { FilterQuery } from 'mongoose';
import { Request } from 'express';

export const filterQueryMap = (): Map<string, string> => {
  return new Map([
    ['in', '$in'],
    ['or', '$or'],
    ['and', '$and'],
    ['contains', 'contains'],
  ]);
};

export const queryToFilter = <T>(req: Request): FilterQuery<T> => {
  const query = Object.assign(req.query, {});
  const filterQuery: FilterQuery<T> = {};
  Object.keys(query).forEach((key) => {
    if (key.startsWith('_')) delete query[key];
  });
  Object.keys(query).forEach((key) => {
    console.log('>>> Checking key: ', key);
    const value: string = query[key].toString();
    const operatorValuePair: string[] = value.split(':');
    if (operatorValuePair.length != 2) {
      Object.assign(filterQuery, { [key]: value });
    } else {
      const operator: string = filterQueryMap().get(operatorValuePair[0]);
      let value;
      switch (operator) {
        case '$in':
          value = operatorValuePair[1].split('|');
          Object.assign(filterQuery, {
            [key]: { [operator]: value },
          });
          break;
        case '$or':
          let or = [];
          value = operatorValuePair[1].split('|');
          value.forEach((_value) => {
            or.push({ [key]: _value });
          });
          Object.assign(filterQuery, { ['$or']: or });
          break;
        case 'contains':
          value = operatorValuePair[1];
          Object.assign(filterQuery, {
            [key]: {
              $regex: value,
              $options: 'i',
            },
          });
      }
      console.log('>>> Operator: ', operator, value);
    }
  });
  console.log('>>> Queries: ', query);
  console.log('>>> Filter query: ', filterQuery);
  return filterQuery;
};

export const limitFilterForUser = <T>(user: IUser): FilterQuery<T> => {
  const filterQuery: FilterQuery<T> = {};
  Object.assign(filterQuery, { user: user._id.toString() });
  return filterQuery;
};
