import * as admin from 'firebase-admin';
import * as util from 'util';
import { FilterQuery, Types } from 'mongoose';
import {
  IFirebaseNotification,
  INotification,
  ISocketNotification,
  Notification,
  NotificationImportance,
  NotificationStrategy,
  TTL,
} from '../../models/notification';
import { schedule } from 'node-cron';
import { FcmToken, IFcmToken } from '../../models/fcmToken';
import { UserRole } from '../../models/enums/userRole';
import { createError } from '../../utils/response';
import { config } from '../../config/config';
import { MessagingTopicResponse } from 'firebase-admin/lib/messaging/messaging-api';

export class NotificationService {
  public async sendNotificationAsync(body: INotification) {
    this.sendNotification(
      body,
      body.strategy || NotificationStrategy.PUSH_ONLY,
      false
    );
  }

  public sendNotification(
    notification: INotification & { fcmTokens?: string[] },
    strategy: NotificationStrategy = NotificationStrategy.PUSH_ONLY,
    save = true
  ) {
    new Promise(async (accept, reject) => {
      if (!notification.content)
        throw createError('Notification content is required', 400);
      if (!notification.group)
        throw createError('Notification group is required', 400);
      if (!notification.tag)
        throw createError('Notification tag is required', 400);
      notification.importance =
        notification.importance || NotificationImportance.HIGH;
      notification.strategy = strategy;
      notification.saveNotification = save;
      notification.itemId =
        notification.itemId || new Types.ObjectId().toHexString();
      if (save)
        notification = await Notification.findOneAndUpdate(
          {
            userId: notification.userId,
            itemId: notification.itemId,
          },
          notification,
          { new: true, upsert: true }
        );
      console.log(
        `Getting fcm token for user: ${notification.userId}, role: ${notification.role}`
      );
      const fcmTokens: string[] =
        notification.fcmTokens ||
        (await this.getFcmTokensForUser(
          notification.userId,
          notification.role
        ));
      if (fcmTokens.length === 0) {
        console.warn(
          `Fcm token for ${notification.userId} is empty. Cannot send: ${notification.tag}, ${notification.content}`
        );
        return;
      } else {
        console.log(
          `Sending fcm to ${notification.userId}, tag: ${
            notification.tag
          }, content: ${notification.content}, tokens: ${fcmTokens.join('.')}`
        );
      }
      switch (strategy) {
        case NotificationStrategy.PUSH_AND_SOCKET:
          await NotificationService.sendFirebaseMessage(
            notification,
            fcmTokens
          );
          await NotificationService.sendSocketMessage(
            notification,
            notification.role
          );
          break;
        case NotificationStrategy.PUSH_BACKGROUND:
        case NotificationStrategy.PUSH_ONLY:
          await NotificationService.sendFirebaseMessage(
            notification,
            fcmTokens
          );
          break;
        case NotificationStrategy.SOCKET_ONLY:
          await NotificationService.sendSocketMessage(
            notification,
            notification.role
          );
          break;
        default:
          console.warn(`Unsupported strategy '${strategy}'`);
      }
      accept(null);
    }).catch((err) => {
      console.error('Notification error: ', err);
    });
  }

  public async getNotifications(
    userId: string,
    role: UserRole
  ): Promise<INotification[]> {
    return await Notification.find({ userId, role })
      .sort({ createdAt: 'desc' })
      .lean()
      .exec();
  }

  public async saveFcmToken(
    userId: string,
    role: UserRole,
    deviceId: string,
    token: string
  ): Promise<IFcmToken> {
    return await FcmToken.findOneAndUpdate(
      { userId, role, deviceId },
      { token },
      { upsert: true, new: true }
    )
      .lean<IFcmToken>()
      .exec();
  }

  public async getFcmTokensForUser(userId, role: UserRole): Promise<string[]> {
    const fcmTokens: IFcmToken[] = await FcmToken.find({ userId, role })
      .lean<IFcmToken[]>()
      .exec();
    return fcmTokens.map((fcmToken) => fcmToken.token);
  }

  public async getFcmTokenForUsers(
    userIds: string[] = [],
    role: UserRole = undefined
  ): Promise<string[]> {
    const filter: FilterQuery<IFcmToken> = {};
    if (userIds && userIds.length > 0) {
      filter.userId = { $in: userIds };
    }
    if (role) {
      filter.role = role;
    }
    return await FcmToken.find(filter)
      .distinct('token')
      .lean<string[]>()
      .exec();
  }

  public async getFcmTokenObjectForUsers(
    userIds: string[] = [],
    role: UserRole = undefined
  ): Promise<IFcmToken[]> {
    const filter: FilterQuery<IFcmToken> = {};
    if (userIds && userIds.length > 0) {
      filter.userId = { $in: userIds };
    }
    if (role) {
      filter.role = role;
    }
    return await FcmToken.find(filter).lean<IFcmToken[]>().exec();
  }

  public static async sendSocketMessage(
    notification: ISocketNotification,
    role: UserRole
  ) {
    // (notification.group as any) = notification.tag;
    // notification.strategy = NotificationStrategy.SOCKET_ONLY;
    // const event = notification.tag;
    // const userId = notification.userId.toString();
    // const socket = SocketServer.getSocket(userId, role);
    // if (socket) {
    //     socket.send(JSON.stringify({event, notification}));
    // } else {
    //     console.warn(`Socket ${userId} with role: ${role} not found to notify: ${event}`);
    // }
  }

  public static async sendBroadcast(
    notification: IFirebaseNotification
  ): Promise<
    MessagingTopicResponse & {
      topic: string;
    }
  > {
    if (!notification.content)
      throw createError('Notification content is required', 400);
    if (!notification.group)
      throw createError('Notification group is required', 400);
    if (!notification.tag)
      throw createError('Notification tag is required', 400);
    notification.ticker = notification.ticker || notification.title;
    notification.importance =
      notification.importance || NotificationImportance.HIGH;
    notification.itemId =
      notification.itemId || new Types.ObjectId().toHexString();
    const environment = config.environment;
    if (!environment) throw createError('Environment not set', 400);
    let topicBuilder = `${environment}-`;
    if (notification.role)
      topicBuilder = topicBuilder.concat(`${notification.role}-`);
    topicBuilder = topicBuilder.concat('broadcast-message');
    topicBuilder = notification.topic || topicBuilder;
    let topic = notification.topic || topicBuilder;
    console.log(`>>> Sending to topic: ${topic}`);
    const response = await Messaging.sendToTopic(topic, {
      notification: {
        tag: notification.tag,
        title: notification.title,
        body: notification.content,
      },
      data: {
        event: notification.tag,
        notification: JSON.stringify(notification),
      },
    });
    return {
      topic,
      messageId: response.messageId,
    };
  }

  public static async sendFirebaseMessage(
    notification: IFirebaseNotification,
    fcmTokens: string[],
    dryRun = false,
    ttl = TTL.XX
  ) {
    notification.importance =
      notification.importance || NotificationImportance.HIGH;
    notification.useSound =
      notification.useSound === null || notification.useSound === undefined
        ? true
        : notification.useSound;
    delete notification.payload;
    console.warn(`Sending notification to: '${fcmTokens}'`);
    if (!fcmTokens || fcmTokens.length === 0) {
      console.warn(`Tokens empty. Cannot send notification`);
      return;
    }
    console.log(
      '>>> Sending notification. Is background? ',
      notification.strategy
    );
    const messagingResponse = await Messaging.sendMulticast(
      {
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                subtitle: notification.content,
                body: notification.content,
              },
              mutableContent: true,
              contentAvailable: true,
              sound: 'default',
            },
          },
          headers: {
            'apns-priority': '5',
            'apns-push-type':
              notification.strategy === NotificationStrategy.PUSH_BACKGROUND
                ? 'background'
                : 'alert',
          },
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          fcmOptions: {
            link: 'https://medical.aeglehealth.io',
          },
          notification: {
            icon: 'https://res.cloudinary.com/teamgrace/image/upload/v1593795514/aegle_zuw2gc.png',
            requireInteraction: true,
            vibrate: 23,
            // timestamp: Date.now(),
            tag: notification.tag,
            title: notification.title,
            body: notification.content,
          },
          data: {
            event: notification.tag,
            notification: JSON.stringify(notification),
          },
        },
        android: {
          priority: 'high',
          // notification: {
          //   color: '#1b2cc1',
          //   icon: 'https://res.cloudinary.com/teamgrace/image/upload/v1593795514/aegle_zuw2gc.png',
          //   channelId: '',
          //   defaultSound: true,
          //   defaultVibrateTimings: true,
          //   // eventTimestamp: new Date(),
          //   notificationCount: 0,
          //   visibility: 'public',
          //   ticker: notification.ticker,
          //   title: notification.title,
          //   body: notification.content,
          //   priority: 'max',
          // },
          data: {
            event: notification.tag,
            notification: JSON.stringify(notification),
          },
        },
        data: {
          event: notification.tag,
          notification: JSON.stringify(notification),
        },
        // notification: {
        //   title: notification.title,
        //   body: notification.content,
        // },
        tokens: fcmTokens,
      },
      dryRun
    );
    console.log(
      'Fcm response: ',
      util.inspect(messagingResponse, true, 5, true)
    );
    if (messagingResponse.failureCount > 0) {
      const failedTokens: string[] = [];
      messagingResponse.responses.forEach((result, index) => {
        if (
          result.error &&
          (result.error.code ===
            'messaging/registration-token-not-registered' ||
            result.error.code === 'messaging/mismatched-credential' ||
            result.error.code === 'messaging/third-party-auth-error' ||
            result.error.code === 'messaging/invalid-argument' ||
            result.error.code === 'messaging/invalid-registration-token')
        ) {
          failedTokens.push(fcmTokens[index]);
        }
      });
      this.removeFailedFcmTokens(failedTokens);
    }
    return messagingResponse;
  }

  private static removeFailedFcmTokens(fcmTokens: string[]) {
    console.log('Removing failed tokens: ', fcmTokens);
    new Promise(async (accept, reject) => {
      try {
        await FcmToken.deleteMany({ token: { $in: fcmTokens } }).exec();
        accept(null);
      } catch (e) {
        reject(e);
      }
    }).catch((err) => {
      console.error('Error removing failed tokens: ', err);
    });
  }

  public static initializeFirebase() {
    const serverKey = require('../../keys/aegle-c55bc-firebase-adminsdk-ypn4k-9eab192f21.json');
    admin.initializeApp({
      credential: admin.credential.cert(serverKey),
    });
    return admin.messaging();
  }

  // Every midnight check for invalid fcm tokens
  public static beginCheckForInvalidTokens() {
    const task = schedule('0 0 0 * * *', () => {
      console.log('Checking invalid tokens');
      new Promise(async (accept, reject) => {
        try {
          const fcmTokens: string[] = await FcmToken.find()
            .distinct('token')
            .lean<string[]>()
            .exec();
          await this.sendFirebaseMessage(
            {
              title: 'title',
              content: 'content',
              ticker: 'ticker',
              tag: 'tag',
              group: 'group',
            } as unknown as INotification,
            fcmTokens,
            true
          );
        } catch (e) {
          reject(e);
        }
      }).catch((err) => {
        console.error('Error checking invalid tokens: ', err);
      });
    });
    task.start();
  }
}

export const Messaging = NotificationService.initializeFirebase();
