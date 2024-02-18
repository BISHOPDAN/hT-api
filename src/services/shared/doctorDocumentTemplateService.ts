import {
  DoctorDocumentTemplate,
  IDoctorDocumentTemplate,
} from '../../models/doctorDocumentTemplate';
import { createError } from '../../utils/response';
import { DocumentsService } from '../doctors/documentsService';

export class DoctorDocumentTemplateService {
  public async addDoctorDocumentTemplate(
    body: IDoctorDocumentTemplate
  ): Promise<IDoctorDocumentTemplate> {
    if (!body.name) throw createError('Name is required', 400);
    if (!body.description) throw createError('Description is required', 400);
    body.name = body.name.trim();
    body.identifier = body.name
      .replace(new RegExp(' ', 'gi'), '_')
      .toLowerCase();
    return await new DoctorDocumentTemplate(body).save();
  }

  public async getDoctorTemplates(): Promise<IDoctorDocumentTemplate[]> {
    return await DoctorDocumentTemplate.find()
      .lean<IDoctorDocumentTemplate[]>()
      .exec();
  }

  public async getDoctorTemplate(
    id: string,
    validate = true
  ): Promise<IDoctorDocumentTemplate> {
    const documentTemplate = await DoctorDocumentTemplate.findById(id)
      .lean<IDoctorDocumentTemplate>()
      .exec();
    if (!documentTemplate && validate)
      throw createError('Document template not found', 404);
    return documentTemplate;
  }

  public async deleteDoctorTemplate(
    id: string
  ): Promise<IDoctorDocumentTemplate> {
    const doctorTemplate = await this.getDoctorTemplate(id);
    await new DocumentsService().deleteDocumentsForTemplate(id);
    await DoctorDocumentTemplate.findByIdAndDelete(id).exec();
    return doctorTemplate;
  }
}
