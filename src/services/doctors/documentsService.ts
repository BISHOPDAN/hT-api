import { DoctorDocument, IDoctorDocument } from '../../models/doctorDocument';
import { AttachmentService } from '../shared/attachmentService';
import { getUpdateOptions, stripUpdateFields } from '../../utils/utils';
import { DoctorDocumentTemplateService } from '../shared/doctorDocumentTemplateService';
import { createError } from '../../utils/response';
import { UserService } from '../admin/userService';
import { DocumentVerificationStatus } from '../../models/enums/documentVerificationStatus';

export class DocumentsService {
  public async uploadDocument(
    user: string,
    file: any,
    body: IDoctorDocument
  ): Promise<IDoctorDocument[]> {
    console.log('>>> 1: Uploading doctor documents: ', body, file);
    if (!file) throw createError('File not attached', 400);
    const driverDocumentTemplate =
      await new DoctorDocumentTemplateService().getDoctorTemplate(
        body.template
      );
    stripUpdateFields(driverDocumentTemplate);
    const attachmentService = new AttachmentService();
    const attachment = await attachmentService.uploadFile(file, false);
    await DoctorDocument.findOneAndUpdate(
      { user, template: body.template },
      Object.assign(driverDocumentTemplate, {
        attachment,
        verificationStatus: DocumentVerificationStatus.PENDING,
      }),
      getUpdateOptions()
    ).exec();
    await new UserService().unVerifyDoctorAccount(
      user,
      'Document pending verification'
    );
    return await this.getDocuments(user);
  }

  public async getDocuments(user: string): Promise<IDoctorDocument[]> {
    return await DoctorDocument.find({ user })
      .populate('template')
      .lean<IDoctorDocument[]>()
      .exec();
  }

  public async verifyDocument(documentId): Promise<IDoctorDocument> {
    return await DoctorDocument.findByIdAndUpdate(
      documentId,
      {
        $set: {
          verificationStatus: DocumentVerificationStatus.VERIFIED,
        },
        $unset: {
          rejectionReason: 1,
        },
      },
      { new: true }
    )
      .populate('template')
      .lean<IDoctorDocument>()
      .exec();
  }

  public async rejectDocument(
    documentId: string,
    rejectionReason: string
  ): Promise<IDoctorDocument> {
    if (!rejectionReason)
      throw createError('Rejection reason is required', 400);
    return await DoctorDocument.findByIdAndUpdate(
      documentId,
      {
        $set: {
          verificationStatus: DocumentVerificationStatus.REJECTED,
          rejectionReason,
        },
      },
      { new: true }
    )
      .populate('template')
      .lean<IDoctorDocument>()
      .exec();
  }

  public async deleteDocumentsForTemplate(templateId: string): Promise<{
    deletedCount: number;
    acknowledged: boolean;
  }> {
    return await DoctorDocument.deleteMany({ templateId }).exec();
  }
}
