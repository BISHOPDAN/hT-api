import { IBaseDocument, IBaseInterface } from './interfaces/baseInterface';
import { MeansOfContact } from './enums/meansOfContact';
import { IUser } from './user';
import { model, Model, Schema } from 'mongoose';
import { AppointmentStatus } from './enums/appointmentStatus';
import { PractitionerType } from './enums/practitionerType';
import { HealthEntity } from './enums/health-choice-entity.enum';

const MongoPaging = require('mongo-cursor-pagination');

export interface IAppointmentMeta extends IBaseInterface {
  key: string;
  value: string;
}

export interface IAppointment extends IBaseDocument {
  user: string | IUser;
  doctor: string | IUser;
  identifier: string;
  status: AppointmentStatus;
  consultationType: PractitionerType;
  meansOfContact: MeansOfContact;
  time: Date;
  startedOn: Date;
  JoinedAt: Date;
  endedOn: Date;
  doctorReminded: boolean;
  patientReminded: boolean;
  patientJoinedAt: Date;
  doctorJoinedAt: Date;
  patientEndReason: string;
  doctorEndReason: string;
  note: string;
  doctorNote: string;
  healthEntity?: HealthEntity;
  healthEntityId?: string;
  meta: IAppointmentMeta[];
}

const appointmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'user', required: false },
    identifier: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: AppointmentStatus.PENDING,
      enum: [
        AppointmentStatus.PENDING,
        AppointmentStatus.APPROVED,
        AppointmentStatus.STARTED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
      ],
    },
    consultationType: {
      type: String,
      required: true,
      enum: Object.values(PractitionerType),
    },
    meansOfContact: {
      type: String,
      required: true,
      enum: [
        MeansOfContact.AUDIO_CALL,
        MeansOfContact.VIDEO_CALL,
        MeansOfContact.CHAT,
      ],
    },
    time: { type: Date, required: true },
    startedOn: { type: Date, required: false },
    JoinedAt: { type: Date, required: false },
    endedOn: { type: Date, required: false },
    doctorReminded: { type: Boolean, default: false },
    patientReminded: { type: Boolean, default: false },
    patientJoinedAt: { type: Date },
    doctorJoinedAt: { type: Date },
    patientEndReason: { type: String },
    doctorEndReason: { type: String },
    note: { type: String, required: false },
    doctorNote: { type: String, required: false },
    healthEntity: {
      type: String,
      enum: Object.values(HealthEntity),
      required: false,
    },
    healthEntityId: {
      type: String,
      required: false,
    },
    meta: {
      type: [
        {
          key: String,
          value: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

appointmentSchema.plugin(MongoPaging.mongoosePlugin);

export const Appointment: Model<IAppointment> = model<IAppointment>(
  'appointment',
  appointmentSchema
);
