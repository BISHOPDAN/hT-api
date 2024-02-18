import { model, Model, Schema } from 'mongoose';
import { IBaseDocument } from './interfaces/baseInterface';
import { UserRole } from './enums/userRole';
import { IAttachment } from './attachment';
import { attachmentDef } from './definitions/attachmentDef';
import { PractitionerType } from './enums/practitionerType';
import { AuthProvider, Gender } from './enums/generalEnum';

const MongoPaging = require('mongo-cursor-pagination');

export const validateProvider = (provider: AuthProvider): boolean => {
  return Object.values(AuthProvider).includes(provider);
};

export interface IUser extends IBaseDocument {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  weight: string;
  height: string;
  referralCode: string;
  provider: AuthProvider;
  roles: UserRole[];
  gender: Gender;
  emailVerified: boolean;
  suspended: boolean;
  doctorProfileVerified: boolean;
  doctorProfileUnverifiedReason: string;
  profilePhotoUrl: string;
  profilePhotoThumbnailUrl: string;
  profilePhotoAttachment?: IAttachment;
  practitionerTypes: PractitionerType[];
}

export const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    gender: {
      type: String,
      required: true,
      enum: [Gender.MALE, Gender.FEMALE, Gender.NIL],
    },
    provider: {
      type: String,
      required: true,
      enum: [AuthProvider.AEGLE, AuthProvider.GOOGLE, AuthProvider.FACEBOOK],
      default: AuthProvider.AEGLE,
    },
    roles: {
      type: [String],
      required: true,
      enum: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN],
    },
    referralCode: { type: String, required: false },
    emailVerified: { type: Boolean, default: false },
    suspended: { type: Boolean, default: false },
    profilePhotoUrl: { type: String, required: false },
    profilePhotoThumbnailUrl: { type: String, required: false },
    profilePhotoAttachment: { type: attachmentDef, required: false },
    doctorProfileVerified: { type: Boolean, default: false },
    doctorProfileUnverifiedReason: { type: String },
    practitionerTypes: {
      type: [String],
      enum: Object.values(PractitionerType),
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.plugin(MongoPaging.mongoosePlugin);

userSchema.index({ firstName: 1 });

export const User: Model<IUser> = model<IUser>('user', userSchema);
