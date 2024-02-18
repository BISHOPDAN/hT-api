import { BaseService } from '../baseService';
import { IFitnessExerciseGroup } from '../../models/fitnessExerciseGroup';
import { ModelName } from '../../models/enums/modelName';
import { UploadService } from './uploadService';
import { AttachmentService } from './attachmentService';
import { getUpdateOptions } from '../../utils/utils';
import { Express } from 'express';

export class FitnessExerciseGroupService extends BaseService<IFitnessExerciseGroup> {
  uploadService: UploadService;

  constructor() {
    super(ModelName.FITNESS_EXERCISE_GROUP);
    this.uploadService = new UploadService();
  }

  async _create(
    file: Express.Multer.File,
    body: IFitnessExerciseGroup
  ): Promise<IFitnessExerciseGroup> {
    const attachmentService = new AttachmentService();
    body.coverAttachment = await attachmentService.uploadFile(
      file,
      file.mimetype.toString().includes('image')
    );
    const title = body.title;
    return await super.updateByOne({ title }, body, getUpdateOptions());
  }
}
