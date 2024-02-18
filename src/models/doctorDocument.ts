import { IAttachment } from './attachment';
import { Model, model, Schema } from 'mongoose';
import { attachmentDef } from './definitions/attachmentDef';
import { IBaseDocument } from './interfaces/baseInterface';
import { DocumentVerificationStatus } from './enums/documentVerificationStatus';

export interface IDoctorDocument extends IBaseDocument {
  template: string;
  user: string;
  name: string;
  description: string;
  identifier: string;
  attachment?: IAttachment;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason: string;
}

const doctorDocumentSchema = new Schema(
  {
    template: {
      type: Schema.Types.ObjectId,
      ref: 'doctorDocumentTemplate',
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    identifier: { type: String, required: true },
    attachment: { type: attachmentDef },
    verificationStatus: {
      type: String,
      enum: Object.values(DocumentVerificationStatus),
      default: DocumentVerificationStatus.PENDING,
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const DoctorDocument: Model<IDoctorDocument> = model<IDoctorDocument>(
  'doctorDocument',
  doctorDocumentSchema
);
