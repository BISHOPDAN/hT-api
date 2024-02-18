import { model, Model, Schema } from 'mongoose';
import { IBaseDocument } from './interfaces/baseInterface';

export enum DoctorDocumentFieldType {
  FILE = 'file',
  TEXT = 'text',
}

export interface IDoctorDocumentTemplate extends IBaseDocument {
  fieldType: DoctorDocumentFieldType;
  identifier: string;
  name: string;
  description: string;
  required: boolean;
}

const doctorDocumentTemplateSchema = new Schema(
  {
    fieldType: {
      type: String,
      enum: Object.values(DoctorDocumentFieldType),
      default: DoctorDocumentFieldType.FILE,
    },
    identifier: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    required: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DoctorDocumentTemplate: Model<IDoctorDocumentTemplate> =
  model<IDoctorDocumentTemplate>(
    'doctorDocumentTemplate',
    doctorDocumentTemplateSchema
  );
