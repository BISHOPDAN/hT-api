import { IBaseDocument } from './interfaces/baseInterface';
import { IAttachment } from './attachment';
import { Schema } from 'mongoose';
import { attachmentDef } from './definitions/attachmentDef';

export interface INutritionGuide extends IBaseDocument {
  title: string;
  description: string;
  pdfAttachment: IAttachment;
  mediaAttachments: [IAttachment];
}

export const nutritionGuideSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    pdfAttachment: attachmentDef,
    mediaAttachments: { type: [attachmentDef], default: [] },
  },
  { timestamps: true }
);
