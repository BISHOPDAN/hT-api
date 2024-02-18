import { Attachment, IAttachment } from '../../models/attachment';
import { ImageContainer, UploadService } from './uploadService';
import { createError } from '../../utils/response';
import { AttachmentEntityModel } from '../../models/enums/attachmentEntityModel';

export class AttachmentService {
  public async uploadFile(
    file: any,
    generateThumbnail = true,
    entity?: string,
    onModel?: AttachmentEntityModel
  ): Promise<IAttachment> {
    if (!file) throw createError('File not attached', 400);
    console.log('>>> Uploading file: ', file);
    const container = ImageContainer.IMAGES;
    if (entity && !onModel) throw createError('Entity model is required', 400);
    const uploadService = new UploadService();
    let thumbnailUrl;
    if (generateThumbnail) {
      const thumbnail = await uploadService.downsizeImage(
        file,
        100,
        100,
        false
      );
      if (file.mimetype.includes('image')) {
        file = await uploadService.downsizeImage(file, 500, 100, false);
      }
      thumbnailUrl = await uploadService.uploadFile(
        thumbnail,
        ImageContainer.THUMBNAILS
      );
    }
    const url = await uploadService.uploadFile(file, container);
    const attachment: IAttachment = {
      url,
      thumbnailUrl,
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      entity: entity,
      onModel: onModel,
    };
    if (entity && onModel) await new Attachment(attachment).save();
    return attachment;
  }

  public async uploadFiles(
    files: any[],
    generateThumbnail = true,
    entity?: string,
    onModel?: AttachmentEntityModel
  ): Promise<IAttachment[]> {
    if (!files || !Array.isArray(files) || files.length === 0)
      throw createError('Files not attached', 400);
    if (entity && !onModel) throw createError('Entity model is required', 400);
    const uploadService = new UploadService();
    const attachments: IAttachment[] = [];
    for (const file of files) {
      const container = ImageContainer.IMAGES;
      let thumbnailUrl;
      if (generateThumbnail) {
        const thumbnail = await uploadService.downsizeImage(
          file,
          100,
          100,
          false
        );
        thumbnailUrl = await uploadService.uploadFile(
          thumbnail,
          ImageContainer.THUMBNAILS
        );
      }
      const url = await uploadService.uploadFile(file, container);
      const attachment: IAttachment = {
        url,
        thumbnailUrl,
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        entity: entity,
        onModel: onModel,
      };
      if (entity && onModel) await new Attachment(attachment).save();
      attachments.push(attachment);
    }

    return attachments;
  }

  public async getAttachmentIdsForEntity(entity: string): Promise<string[]> {
    return await Attachment.find({ entity })
      .distinct('_id')
      .lean<string[]>()
      .exec();
  }
}

export interface IAttachmentConfig {
  entity: string;
  onModel: AttachmentEntityModel;
}
