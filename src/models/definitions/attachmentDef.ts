import { Schema } from 'mongoose';
import { AttachmentEntityModel } from '../enums/attachmentEntityModel';

export const attachmentDef = {
  url: { type: String, required: true },
  thumbnailUrl: { type: String, required: false },
  key: { type: String, required: false },
  bucket: { type: String, required: false },
  originalName: { type: String, required: false },
  fileName: { type: String, required: false },
  mimeType: { type: String, required: true },
  entity: { type: Schema.Types.ObjectId, refPath: 'onModel', select: false },
  onModel: {
    type: String,
    enum: [AttachmentEntityModel.USER, AttachmentEntityModel.DOCTOR_DOCUMENT],
    select: false,
  },
};
