import { BaseService } from '../baseService';
import { IFitnessExercise } from '../../models/fitnessExercise';
import { ModelName } from '../../models/enums/modelName';
import { AttachmentService } from './attachmentService';
import { getUpdateOptions } from '../../utils/utils';
import { Express } from 'express';

export class FitnessExercisesService extends BaseService<IFitnessExercise> {
  private readonly attachmentService: AttachmentService;

  constructor() {
    super(ModelName.FITNESS_EXERCISE);
    this.attachmentService = new AttachmentService();
  }

  async _create(
    file: Express.Multer.File,
    body: IFitnessExercise
  ): Promise<IFitnessExercise> {
    body.coverAttachment = await this.attachmentService.uploadFile(
      file,
      file.mimetype.toString().includes('image')
    );
    const title = body.title;
    const exerciseGroup = body.exerciseGroup;
    console.log('>>> Saving', body);
    return await super.updateByOne(
      { title, exerciseGroup },
      body,
      getUpdateOptions()
    );
  }

  async addAttachments(
    id: string,
    file: Express.Multer.File
  ): Promise<IFitnessExercise> {
    const fitnessExercise = await super.findById(id);
    const attachment = await this.attachmentService.uploadFile(
      file,
      file.mimetype.toString().includes('image')
    );
    return await super.updateById(fitnessExercise._id, {
      $push: { mediaAttachments: attachment },
    });
  }
}
