import { IBaseDocument } from './baseInterface';

export interface IPrice {
  amount: number;
  currency: string;
  previousAmount?: number;
}
