import { BaseService } from '../baseService';
import { INutritionGuide } from '../../models/nutritionGuide';
import { ModelName } from '../../models/enums/modelName';
import { AttachmentService } from './attachmentService';
import { getUpdateOptions } from '../../utils/utils';
import { createError } from '../../utils/response';
import { Express } from 'express';

export class NutritionGuidesService extends BaseService<INutritionGuide> {
  private readonly attachmentService: AttachmentService;

  constructor() {
    super(ModelName.NUTRITION_GUIDE);
    this.attachmentService = new AttachmentService();
  }

  async _create(
    file: Express.Multer.File,
    body: INutritionGuide
  ): Promise<INutritionGuide> {
    if (!file.mimetype.toString().includes('pdf')) {
      throw createError('Only pdf files allowed', 400);
    }
    body.pdfAttachment = await this.attachmentService.uploadFile(file, false);
    const title = body.title;
    console.log('>>> Saving', body);
    return await super.updateByOne({ title }, body, getUpdateOptions());
  }

  async addAttachments(
    id: string,
    file: Express.Multer.File
  ): Promise<INutritionGuide> {
    const nutritionGuide = await super.findById(id);
    const attachment = await this.attachmentService.uploadFile(
      file,
      file.mimetype.toString().includes('image')
    );
    return await super.updateById(nutritionGuide._id, {
      $push: { mediaAttachments: attachment },
    });
  }
}
