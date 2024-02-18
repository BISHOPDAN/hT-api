import { ModelName } from '../models/enums/modelName';
import {
  FilterQuery,
  model,
  Model,
  QueryOptions,
  SortOrder,
  UpdateQuery,
} from 'mongoose';
import { stripUpdateFields } from '../utils/utils';
import { createError } from '../utils/response';

export abstract class BaseService<T> {
  _model: Model<T>;

  protected constructor(modelName: ModelName) {
    this._model = model<T>(modelName);
  }

  async create(body: T): Promise<T> {
    return await this._model.create(body);
  }

  async createWithUser(user: string, body: T): Promise<T> {
    (body as any).user = user;
    return await this._model.create(body);
  }

  async findById(
    id: string,
    generalOptions: IGeneralOptions = {}
  ): Promise<T | null | undefined> {
    this.assignDefaultsToValidationRule(generalOptions);
    const query = this._model.findById(id);
    if (generalOptions.populate) {
      query.populate(generalOptions.populate);
    }
    const result = await query.lean<T>().exec();
    if (!result && generalOptions.validate) {
      throw createError(generalOptions.validationErrorMessage);
    }
    return result;
  }

  async findOne(
    filter: FilterQuery<T> = {},
    options: QueryOptions = {},
    generalOptions: IGeneralOptions = {}
  ): Promise<T | null | undefined> {
    this.assignDefaultsToValidationRule(generalOptions);
    const query = this._model.findOne(filter, null, options);
    if (generalOptions.populate) {
      query.populate(generalOptions.populate);
    }
    const result = await query.lean<T>().exec();
    if (!result && generalOptions.validate) {
      throw createError(generalOptions.validationErrorMessage, 400);
    }
    return result;
  }

  async find(
    filter: FilterQuery<T> = {},
    options: QueryOptions = {},
    generalOptions: IGeneralOptions = {}
  ): Promise<T[]> {
    console.log('>>> Finding: ', filter);
    let query = this._model.find(filter, null, options);
    if (generalOptions.populate) {
      query.populate(generalOptions.populate);
    }
    if (generalOptions.sort) {
      query.sort(generalOptions.sort);
    }
    return await query.lean<T[]>().exec();
  }

  async updateById(
    id: string,
    query: UpdateQuery<T> = {},
    options: QueryOptions = {}
  ): Promise<T> {
    stripUpdateFields(query.$set);
    options = options || {};
    options.new = true;
    return await this._model
      .findByIdAndUpdate(id, query, options)
      .lean<T>()
      .exec();
  }

  async updateByOne(
    filter: FilterQuery<T> = {},
    query: UpdateQuery<T> = {},
    options: QueryOptions = {}
  ): Promise<T> {
    stripUpdateFields(query, query.$set);
    options = options || {};
    options.new = true;
    return await this._model
      .findOneAndUpdate(filter, query, options)
      .lean<T>()
      .exec();
  }

  async delete(id: string): Promise<T> {
    return await this._model.findByIdAndDelete(id).lean<T>().exec();
  }

  private assignDefaultsToValidationRule(generalOptions: IGeneralOptions) {
    generalOptions.validate !== null && generalOptions.validate !== undefined
      ? generalOptions.validate
      : true;
    generalOptions.validationErrorMessage =
      generalOptions.validationErrorMessage || 'Record not found';
  }
}

export interface IGeneralOptions {
  validate?: boolean;
  validationErrorMessage?: string;
  populate?: string | string[];
  sort?:
    | string
    | { [key: string]: SortOrder | { $meta: 'textScore' } }
    | [string, SortOrder][]
    | undefined
    | null;
}
