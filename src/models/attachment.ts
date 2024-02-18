import { IBaseDocument, IBaseInterface } from './interfaces/baseInterface';
import { model, Model, Schema } from 'mongoose';
import { attachmentDef } from './definitions/attachmentDef';
import { AttachmentEntityModel } from './enums/attachmentEntityModel';
import { IUser } from './user';

export interface IAttachment extends IBaseInterface {
  url: string;
  thumbnailUrl?: string;
  key?: string;
  originalName?: string;
  fileName?: string;
  mimeType: string;
  entity?: string | IUser;
  onModel?: AttachmentEntityModel;
}

const attachmentSchema = new Schema(attachmentDef, { timestamps: true });

export const Attachment: Model<IAttachment> = model<IAttachment>(
  'attachment',
  attachmentSchema
);
