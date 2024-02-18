import { model, Model, Schema } from 'mongoose';
import { UserRole } from './enums/userRole';
import { IBaseDocument } from './interfaces/baseInterface';

export enum TTL {
  X = 60,
  XX = 1800,
  XXX = 3600,
}

export enum NotificationGroup {
  ACCOUNT_STATUS = 'account_status',
  APPOINTMENT = 'appointment',
  APPOINTMENT_MESSAGE = 'appointment_message',
  APPOINTMENT_REMINDER = 'appointment_message',
  SUBSCRIPTION = 'subscription',
  BROADCAST_MESSAGE = 'broadcast_message',
  VOIP = 'voip',
}

export enum NotificationTag {
  ACCOUNT_STATUS = 'account_status',
  APPOINTMENT = 'appointment',
  APPOINTMENT_MESSAGE = 'appointment_message',
  APPOINTMENT_REMINDER = 'appointment_message',
  SUBSCRIPTION = 'subscription',
  BROADCAST_MESSAGE = 'broadcast_message',
  VOIP = 'voip',
}

export enum NotificationImportance {
  HIGH = 'high',
  NORMAL = 'normal',
  MIN = 'min',
}

export enum NotificationStrategy {
  PUSH_BACKGROUND = 'push_background',
  PUSH_ONLY = 'push_only',
  SOCKET_ONLY = 'socket_only',
  PUSH_AND_SOCKET = 'push_and_socket',
}

export interface ISocketNotification {
  userId?: string;
  content?: string;
  group?: NotificationGroup;
  tag: NotificationTag;
  strategy?: NotificationStrategy;
  payload?: any;
  extras?: INotificationExtras[];
}

export interface IFirebaseNotification extends ISocketNotification {
  importance?: NotificationImportance;
  role?: UserRole;
  content: string;
  itemId?: string;
  ticker?: string;
  title?: string;
  useSound?: boolean;
  saveNotification?: boolean;
  background?: boolean;
  topic?: string;
}

export interface INotification extends IFirebaseNotification {
  seen?: boolean;
  previewImageUri?: string;
  previewImageUriThumbnail?: string;
  payload?: any;
}

export interface INotificationExtras {
  key: string;
  value: string;
}

export interface INotificationImpl extends INotification, IBaseDocument {}

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    role: { type: String, required: true },
    tag: { type: String, required: true },
    group: { type: String, required: true },
    importance: { type: String, required: true },
    strategy: { type: String, required: true },
    itemId: { type: String, required: false },
    ticker: { type: String, required: false },
    title: { type: String, required: false },
    seen: { type: Boolean, default: false },
    useSound: { type: Boolean, default: true },
    saveNotification: { type: Boolean, default: false },
    previewImageUri: { type: String, required: false },
    previewImageUriThumbnail: { type: String, required: false },
    payload: { type: Schema.Types.Mixed, required: false },
    extras: { type: [{ key: String, value: String }], default: [] },
  },
  { timestamps: true }
);

export const Notification: Model<INotificationImpl> = model<INotificationImpl>(
  'notification',
  notificationSchema
);
