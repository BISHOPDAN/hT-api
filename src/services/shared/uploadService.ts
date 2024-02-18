import multer from 'multer';
import { generate } from 'voucher-code-generator';
import moment from 'moment';
import Jimp from 'jimp';
import { S3 } from 'aws-sdk';
import { createError } from '../../utils/response';
import { config } from '../../config/config';
import { IAttachment } from '../../models/attachment';
import { DeletedObject } from 'aws-sdk/clients/s3';

const fs = require('fs');
const os = require('os');
const s3 = new S3({
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsAccessKey,
  },
});

export enum ImageContainer {
  IMAGES = 'aegle-v2-images-02',
  THUMBNAILS = 'aegle-v2-image-thumbnails-02',
}

export class UploadService {
  public async downsizeImage(
    file,
    width,
    quality = 100,
    blur
  ): Promise<{
    path: string;
    originalname: string;
    filename: string;
    mimetype: string;
    destination: string;
    size: number;
  }> {
    try {
      const filePath =
        './' + file.destination + '/' + 'resized_' + file.originalname;
      const imageFile = await Jimp.read(file.path);
      const image = imageFile.resize(width, Jimp.AUTO).quality(quality);
      if (blur) image.blur(2);
      await image.writeAsync(filePath);
      const stats = fs.statSync(filePath);
      return {
        originalname: file.originalname,
        path: filePath,
        filename: 'resized_' + file.filename,
        mimetype: file.mimetype,
        destination: file.destination,
        size: stats.size,
      };
    } catch (e) {
      console.error(e);
      throw createError('Error while downsizing file', 500);
    }
  }

  public async uploadFile(file, container: ImageContainer): Promise<string> {
    if (!file) throw createError('File missing', 400);
    // await s3.createBucket({ Bucket: container, ACL: 'public-read' }).promise();
    const fileStream = fs.createReadStream(file.path);
    const uploadResult = await s3
      .upload({
        Bucket: container,
        Key: file.filename,
        Body: fileStream,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })
      .promise();
    const s3Url = uploadResult.Location;
    return uploadResult.Location;
    // if (container === ImageContainer.VIDEOS)
    //     return `${config.awsCloudFrontDomain}/${s3Url.split('/').pop()}`
    // else
  }

  public async deleteFile(attachment: IAttachment): Promise<boolean> {
    if (!attachment.key) return false;
    await s3
      .deleteObject({
        Bucket: ImageContainer.IMAGES,
        Key: attachment.key,
      })
      .promise();
    return (
      await s3
        .deleteObject({
          Bucket: ImageContainer.THUMBNAILS,
          Key: attachment.key,
        })
        .promise()
    ).DeleteMarker;
  }

  public async deleteFiles(
    attachments: IAttachment[]
  ): Promise<DeletedObject[]> {
    if (attachments.length === 0) return [];
    await s3
      .deleteObjects({
        Bucket: ImageContainer.IMAGES,
        Delete: {
          Objects: attachments.map((attachment) => {
            return { Key: attachment.key };
          }),
        },
      })
      .promise();
    return (
      await s3
        .deleteObjects({
          Bucket: ImageContainer.THUMBNAILS,
          Delete: {
            Objects: attachments.map((attachment) => {
              return { Key: attachment.key };
            }),
          },
        })
        .promise()
    ).Deleted;
  }

  public static getTempFolder(): string {
    let uploadDirectory = os.tmpdir();
    const tempDirectoryExists = fs.existsSync(uploadDirectory);
    console.log('Temp directory exists? ', tempDirectoryExists);
    if (tempDirectoryExists) {
      console.log('Temp directory: ', uploadDirectory);
      uploadDirectory = uploadDirectory.toString();
      if (uploadDirectory.includes(':'))
        uploadDirectory = uploadDirectory.split(':')[1];
    } else {
      uploadDirectory = 'uploads/';
      if (!fs.existsSync(uploadDirectory)) fs.mkdirSync(uploadDirectory);
    }
    console.log('Upload directory: ', uploadDirectory);
    return uploadDirectory;
  }
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, UploadService.getTempFolder());
    },
    filename: (req, file: any, callback) => {
      const fileParts = file.originalname.split('.');
      const fileExtension = '.' + fileParts[fileParts.length - 1];
      file.extension = fileExtension;
      // let name =  new Date().toString().replace(/\s+/g, '-').toLowerCase()+fileExtension;
      const name =
        moment(new Date())
          .format('YYYY-MM-DD--HH:mm:ss')
          .replace(/[\W_]+/g, '-')
          .toLowerCase() +
        generate({
          charset: '0123456789',
          length: 4,
          count: 1,
        })[0] +
        fileExtension;
      callback(null, name);
    },
  }),
});
