import {
  Appointment,
  IAppointment,
  IAppointmentMeta,
} from '../../models/appointment';
import { createError } from '../../utils/response';
import {
  MeansOfContact,
  validateMeansOfContact,
} from '../../models/enums/meansOfContact';
import moment from 'moment-timezone';
import { NotificationService } from './notificationService';
import {
  NotificationGroup,
  NotificationImportance,
  NotificationStrategy,
  NotificationTag,
} from '../../models/notification';
import { UserRole } from '../../models/enums/userRole';
import {
  getPractitionerTypeDisplayName,
  PractitionerType,
  validatePractitionerType,
} from '../../models/enums/practitionerType';
import { UserSubscriptionService } from './userSubscriptionService';
import { AppointmentStatus } from '../../models/enums/appointmentStatus';
import { IUser } from '../../models/user';
import * as twilio from 'twilio';
import { config } from '../../config/config';
import * as util from 'util';
import { UserService } from './userService';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { schedule } from 'node-cron';
import { switchRole } from '../../utils/utils';
import { HealthEntity } from '../../models/enums/health-choice-entity.enum';
import { FitnessPlanService } from './fitnessPlanService';
import { IPersonalHealthQuery } from '../../models/personalHealthQuery';
import { charset, generate } from 'voucher-code-generator';

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

export class AppointmentService {
  public async requestAppointment(
    user: string,
    body: IAppointment,
    timezone
  ): Promise<IAppointment> {
    timezone = timezone || 'Africa/Lagos';
    console.log(`>>> New appointment Time. ${body.time} timezone: ${timezone}`);
    if (!body.consultationType)
      throw createError('Consultation type is required', 400);
    if (!body.meansOfContact)
      throw createError('Means of contact is required', 400);
    if (!body.time) throw createError('Time is required', 400);
    if (!validatePractitionerType(body.consultationType))
      throw createError(
        `Unsupported consultation type '${body.consultationType}'`,
        400
      );
    if (!validateMeansOfContact(body.meansOfContact))
      throw createError(
        `Unsupported means of contact type '${body.meansOfContact}'`,
        400
      );
    const runningAppointment = await this.getUnCompletedAppointments(user);
    if (runningAppointment.length > 0)
      throw createError('Please complete your previous appointment', 400);
    const nowMoment = moment().tz(timezone, true).set('seconds', 0);
    const timeMoment = moment(body.time).tz(timezone, true).set('seconds', 0);
    const appointmentTime = timeMoment.toDate();
    console.log(
      `Now moment: ${nowMoment}, time moment: ${timeMoment}, appointment time: ${appointmentTime}`
    );
    if (nowMoment.isAfter(timeMoment))
      throw createError('Time cannot be in the past', 400);
    body.user = user;
    body.time = appointmentTime;
    body.identifier = generate({
      charset: charset('numbers'),
      pattern: '###-###',
      count: 1,
    })[0];
    await new UserSubscriptionService().applySubscription(
      user,
      body.consultationType
    );
    let appointment = await Appointment.findOne({
      user,
      time: appointmentTime,
      status: {
        $nin: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
      },
    })
      .lean<IAppointment>()
      .exec();
    if (appointment)
      throw createError(
        `You already have an appointment for ${timeMoment.format('LLL')}`,
        400
      );
    body.meta = await this.getMeta(body);
    appointment = await new Appointment(body).save();
    appointment = await this.getAppointment(appointment._id);
    const patient: IUser = appointment.user as IUser;
    const notificationService = new NotificationService();
    const appointmentTimeMoment = moment(appointment.time);
    await notificationService.sendNotification(
      {
        userId: user,
        title: 'Appointment booked',
        ticker: 'Appointment booked',
        content:
          'We have received your appointment request. A doctor will be with you shortly',
        itemId: appointment._id,
        role: UserRole.PATIENT,
        tag: NotificationTag.APPOINTMENT,
        group: NotificationGroup.APPOINTMENT,
      },
      NotificationStrategy.PUSH_ONLY,
      true
    );
    const doctors: IUser[] =
      await new UserService().getDoctorsByPractitionerType(
        appointment.consultationType
      );
    const fcmTokens: string[] = await notificationService.getFcmTokenForUsers(
      doctors.map((doctor) => doctor._id.toString()),
      UserRole.DOCTOR
    );
    await NotificationService.sendFirebaseMessage(
      {
        title: 'New Appointment',
        ticker: 'New Appointment',
        content: `${
          patient.firstName
        } has booked  a new appointment  scheduled for ${appointmentTimeMoment.format(
          'h:mma dddd'
        )}`,
        itemId: appointment._id,
        tag: NotificationTag.APPOINTMENT,
        group: NotificationGroup.APPOINTMENT,
      },
      fcmTokens
    );
    await this.updateHealthEntityWithAppointmentId(
      appointment.healthEntity,
      appointment.healthEntityId,
      appointment._id.toString()
    );
    return appointment;
  }

  private async getMeta(body: IAppointment): Promise<IAppointmentMeta[]> {
    let meta: IAppointmentMeta[] = [];
    if (body.healthEntity && body.healthEntityId) {
      switch (body.healthEntity) {
        case HealthEntity.PERSONAL_FITNESS_PLAN:
          meta.push({
            key: 'Entity',
            value: 'Personal fitness plan',
          });
          let personalFitnessPlan = await new FitnessPlanService().findById(
            body.healthEntityId,
            {
              populate: 'personalHealthQuery',
            }
          );
          if (typeof personalFitnessPlan?.personalHealthQuery === 'object') {
            (
              personalFitnessPlan.personalHealthQuery as IPersonalHealthQuery
            ).responses.forEach((value) => {
              meta.push({
                key: value.question,
                value: value.answers.join(','),
              });
            });
          }
          break;
        case HealthEntity.NUTRITION_GUIDE:
          meta.push({
            key: 'Entity',
            value: 'Nutrition guide',
          });
          break;
      }
    }
    return meta;
  }

  private async updateHealthEntityWithAppointmentId(
    healthEntity: HealthEntity,
    healthEntityId: string,
    appointmentId: string
  ) {
    console.log(
      `>>> Attempting to update fitness entity: ${healthEntity} with id: ${healthEntityId}`
    );
    if (!healthEntity || !healthEntityId)
      return console.warn('>>> Will not update health entity. None attached');
    console.log(
      `>>> Updating fitness entity: ${healthEntity} with id: ${healthEntityId}`
    );
    switch (healthEntity) {
      case HealthEntity.PERSONAL_FITNESS_PLAN:
        await new FitnessPlanService().updateById(healthEntityId, {
          $set: {
            appointment: appointmentId,
          },
        });
    }
  }

  public async rescheduleAppointment(
    user: string,
    id: string,
    body: IAppointment,
    timezone
  ): Promise<IAppointment> {
    timezone = timezone || 'Africa/Lagos';
    const nowMoment = moment().tz(timezone, true).set('seconds', 0);
    const timeMoment = moment(body.time).tz(timezone, true).set('seconds', 0);
    const appointmentTime = timeMoment.toDate();
    console.log(
      `Now moment: ${nowMoment}, time moment: ${timeMoment}, appointment time: ${appointmentTime}`
    );
    if (nowMoment.isAfter(timeMoment))
      throw createError('Time cannot be in the past', 400);
    const notificationService = new NotificationService();
    const appointment = await Appointment.findByIdAndUpdate(id, {
      $set: {
        time: appointmentTime,
      },
    }).exec();
    await notificationService.sendNotification(
      {
        userId: user,
        title: 'Appointment rescheduled',
        ticker: 'Appointment rescheduled',
        content: `Your appointment has been rescheduled to ${timeMoment.format(
          'h:mma dddd'
        )}`,
        itemId: appointment._id,
        role: UserRole.PATIENT,
        tag: NotificationTag.APPOINTMENT,
        group: NotificationGroup.APPOINTMENT,
      },
      NotificationStrategy.PUSH_ONLY,
      true
    );
    if (appointment.doctor) {
      const user = appointment.user as IUser;
      const doctor = appointment.doctor as IUser;
      await notificationService.sendNotification(
        {
          userId: doctor._id,
          title: 'Appointment rescheduled',
          ticker: 'Appointment rescheduled',
          content: `${
            user.firstName
          } has rescheduled appointment to ${timeMoment.format('h:mma dddd')}`,
          itemId: appointment._id,
          role: UserRole.DOCTOR,
          tag: NotificationTag.APPOINTMENT,
          group: NotificationGroup.APPOINTMENT,
        },
        NotificationStrategy.PUSH_ONLY,
        true
      );
    }
    return await this.getAppointment(id);
  }

  public async getAppointments(
    user: string,
    role: UserRole,
    limit?: string,
    status?: AppointmentStatus,
    startDate?: string,
    endDate?: string
  ): Promise<IAppointment[]> {
    if (role === UserRole.DOCTOR && status === AppointmentStatus.PENDING) {
      const doctor = await new UserService().getUser(user);
      return await this.getPendingAppointments(
        user,
        doctor.practitionerTypes,
        limit
      );
    }
    if (
      role === UserRole.DOCTOR &&
      (status === AppointmentStatus.APPROVED ||
        status === AppointmentStatus.STARTED)
    )
      return await this.getRunningAppointments(user);
    const filter: any = {
      $or: [{ user: user }, { doctor: user }],
    };
    if (status) Object.assign(filter, { status: status });
    if (startDate && endDate) {
      const startDateMoment = moment(startDate, 'YYYY-MM-DD', true);
      const endDateMoment = moment(endDate, 'YYYY-MM-DD', true);
      Object.assign(filter, {
        $and: [
          { createdAt: { $gte: startDateMoment.toDate() } },
          { createdAt: { $lte: endDateMoment.toDate() } },
        ],
      });
    }
    console.log('>>> Get appointment filter: ', filter);
    return await Appointment.find(filter)
      .populate('user doctor')
      .sort({ updatedAt: 'desc' })
      .limit(limit ? Number(limit) : undefined)
      .lean<IAppointment[]>()
      .exec();
  }

  public async getPendingAppointments(
    user: string,
    practitionerTypes: PractitionerType[],
    limit?: string
  ): Promise<IAppointment[]> {
    return await Appointment.find({
      status: AppointmentStatus.PENDING,
      consultationType: { $in: practitionerTypes },
    })
      .populate('user doctor')
      .sort({ createdAt: 'desc' })
      .limit(limit ? Number(limit) : undefined)
      .lean<IAppointment[]>()
      .exec();
  }

  public async getRunningAppointments(user: string): Promise<IAppointment[]> {
    const filterQuery: FilterQuery<IAppointment> = {
      doctor: user,
      $or: [
        { status: AppointmentStatus.APPROVED },
        { status: AppointmentStatus.STARTED },
      ],
    };
    return await Appointment.find(filterQuery)
      .populate('user doctor')
      .sort({ createdAt: 'desc' })
      .lean<IAppointment[]>()
      .exec();
  }

  public async getUnCompletedAppointments(
    user: string
  ): Promise<IAppointment[]> {
    const filterQuery: FilterQuery<IAppointment> = {
      $or: [{ user }, { doctor: user }],
      status: {
        $nin: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
      },
    };
    return await Appointment.find(filterQuery)
      .populate('user doctor')
      .sort({ createdAt: 'desc' })
      .lean<IAppointment[]>()
      .exec();
  }

  public async getAppointment(id: string): Promise<IAppointment> {
    const appointment = Appointment.findById(id)
      .populate('user doctor')
      .lean<IAppointment>()
      .exec();
    if (!appointment) throw createError('Appointment not found', 400);
    return appointment;
  }

  public async approveAppointment(
    user: string,
    id: string
  ): Promise<IAppointment> {
    await Appointment.findByIdAndUpdate(id, {
      doctor: user,
      status: AppointmentStatus.APPROVED,
    }).exec();
    const appointment = await this.getAppointment(id);
    const patient = appointment.user as IUser;
    await new NotificationService().sendNotification(
      {
        userId: patient._id,
        title: 'Appointment approved',
        ticker: `Appointment approved`,
        content: `${getPractitionerTypeDisplayName(
          appointment.consultationType
        )} ${
          (appointment.doctor as IUser).firstName
        } has approved your appointment`,
        itemId: appointment._id,
        role: UserRole.PATIENT,
        tag: NotificationTag.APPOINTMENT,
        group: NotificationGroup.APPOINTMENT,
      },
      NotificationStrategy.PUSH_ONLY,
      true
    );
    return appointment;
  }

  public async startAppointment(
    user: string,
    id: string
  ): Promise<IAppointment> {
    await Appointment.findByIdAndUpdate(id, {
      status: AppointmentStatus.STARTED,
    }).exec();
    const appointment = await this.getAppointment(id);
    const appointmentTimeMoment = moment(appointment.time);
    const patient = appointment.user as IUser;
    await new NotificationService().sendNotification(
      {
        userId: patient._id,
        title: 'Appointment started',
        ticker: `Appointment started`,
        content: `${getPractitionerTypeDisplayName(
          appointment.consultationType
        )} ${
          (appointment.doctor as IUser).firstName
        } in the consulting room and has started your appointment scheduled for ${appointmentTimeMoment.format(
          'h:mma dddd'
        )}`,
        itemId: appointment._id,
        role: UserRole.PATIENT,
        tag: NotificationTag.APPOINTMENT,
        group: NotificationGroup.APPOINTMENT,
      },
      NotificationStrategy.PUSH_ONLY,
      true
    );
    return appointment;
  }

  public async joinAppointment(
    userId: string,
    role: UserRole,
    id: string
  ): Promise<IAppointment> {
    const now = moment();
    const updateQuery: UpdateQuery<IAppointment> =
      role === UserRole.DOCTOR
        ? {
            $set: { doctorJoinedAt: now.toDate() },
          }
        : {
            $set: { patientJoinedAt: now.toDate() },
          };
    const appointment = await Appointment.findByIdAndUpdate(id, updateQuery)
      .populate('user doctor')
      .exec();
    const user: IUser =
      role === UserRole.DOCTOR
        ? (appointment.doctor as IUser)
        : (appointment.user as IUser);
    const recipient: IUser =
      role === UserRole.DOCTOR
        ? (appointment.user as IUser)
        : (appointment.doctor as IUser);
    if (
      appointment.meansOfContact === MeansOfContact.VIDEO_CALL ||
      appointment.meansOfContact === MeansOfContact.AUDIO_CALL
    ) {
      await new NotificationService().sendNotification(
        {
          userId: recipient._id,
          title: 'Appointment joined',
          ticker: `Appointment joined`,
          content: `${recipient.firstName} has joined the appointment`,
          itemId: appointment._id,
          role: switchRole(role),
          tag: NotificationTag.VOIP,
          group: NotificationGroup.VOIP,
          strategy: NotificationStrategy.PUSH_BACKGROUND,
          extras: [
            { key: 'caller', value: user.firstName },
            {
              key: 'hasVideo',
              value: (appointment.meansOfContact === 'video_call').toString(),
            },
          ],
        },
        NotificationStrategy.PUSH_BACKGROUND,
        true
      );
    } else {
      await new NotificationService().sendNotification(
        {
          userId: recipient._id,
          title: 'Appointment joined',
          ticker: `Appointment joined`,
          content: `${recipient.firstName} has joined the appointment`,
          itemId: appointment._id,
          role: switchRole(role),
          tag: NotificationTag.APPOINTMENT,
          group: NotificationGroup.APPOINTMENT,
          strategy: NotificationStrategy.PUSH_ONLY,
        },
        NotificationStrategy.PUSH_ONLY,
        true
      );
    }
    return await this.getAppointment(id);
  }

  public async completeAppointment(
    user: string,
    role: UserRole,
    id: string,
    reason: string
  ): Promise<IAppointment> {
    const set: any = { status: AppointmentStatus.COMPLETED };
    if (role === UserRole.DOCTOR) {
      Object.assign(set, { doctorEndReason: reason });
    } else if (role === UserRole.PATIENT) {
      Object.assign(set, { patientEndReason: reason });
    }
    await Appointment.findByIdAndUpdate(id, {
      $set: set,
    }).exec();
    const appointment = await this.getAppointment(id);
    const contentForPatient = appointment.patientJoinedAt
      ? `${getPractitionerTypeDisplayName(appointment.consultationType)} ${
          (appointment.doctor as IUser).firstName
        } has completed your appointment`
      : `${getPractitionerTypeDisplayName(appointment.consultationType)} ${
          (appointment.doctor as IUser).firstName
        } was in the consultation room but you didn't join. You can book again to get another appointment.`;
    const recipient: IUser =
      role === UserRole.DOCTOR
        ? (appointment.user as IUser)
        : (appointment.doctor as IUser);
    const content =
      role === UserRole.DOCTOR
        ? contentForPatient
        : `${
            (appointment.user as IUser).firstName
          } has completed this appointment`;
    await new NotificationService().sendNotification(
      {
        userId: recipient._id,
        title: 'Appointment completed',
        ticker: `Appointment completed`,
        content: content,
        itemId: appointment._id,
        role: role === UserRole.DOCTOR ? UserRole.PATIENT : UserRole.DOCTOR,
        tag: NotificationTag.APPOINTMENT,
        group: NotificationGroup.APPOINTMENT,
      },
      NotificationStrategy.PUSH_ONLY,
      true
    );
    return appointment;
  }

  public async addDoctorNote(
    id: string,
    body: IAppointment
  ): Promise<IAppointment> {
    if (!body.doctorNote) throw createError('Doctor not is required', 400);
    await Appointment.findByIdAndUpdate(id, {
      $set: { doctorNote: body.doctorNote },
    }).exec();
    const appointment = await this.getAppointment(id);
    let content = `${getPractitionerTypeDisplayName(
      appointment.consultationType
    )} ${
      (appointment.doctor as IUser).firstName
    } added a note to your appointment`;
    let recipient = appointment.user as IUser;
    await new NotificationService().sendNotification(
      {
        userId: recipient._id,
        title: 'Appointment note',
        ticker: `Appointment note`,
        content: content,
        itemId: appointment._id,
        role: UserRole.PATIENT,
        tag: NotificationTag.APPOINTMENT,
        group: NotificationGroup.APPOINTMENT,
      },
      NotificationStrategy.PUSH_ONLY,
      true
    );
    return appointment;
  }

  public async countByStatus(
    user: string,
    practitionerTypes: PractitionerType[] = [],
    ...statuses: AppointmentStatus[]
  ): Promise<number> {
    const filter: FilterQuery<IAppointment> = {};
    if (statuses.length > 0) {
      filter.status = { $in: statuses };
    }
    if (!statuses.includes(AppointmentStatus.PENDING))
      Object.assign(filter, {
        $or: [{ user: user }, { doctor: user }],
      });
    if (
      practitionerTypes.length > 0 &&
      statuses.includes(AppointmentStatus.PENDING)
    ) {
      Object.assign(filter, {
        consultationType: { $in: practitionerTypes },
      });
    }
    return await Appointment.countDocuments(filter).exec();
  }

  public async initializeVideo(
    user: string,
    role: UserRole,
    id: string
  ): Promise<{ token: string }> {
    const token = new AccessToken(
      config.twilioAccountSid,
      config.twilioApiKey,
      config.twilioApiSecret,
      { identity: user }
    );
    console.log(
      '>>> Twilio access token obj: ',
      util.inspect(token, true, 5, true)
    );
    const videoGrant = new VideoGrant();
    token.addGrant(videoGrant);
    return {
      token: token.toJwt(),
    };
  }

  public static beginCheckForApproachingAppointments() {
    const task = schedule('* * * * *', () => {
      console.log('>>> Checking approaching appointments');
      new Promise(async (accept, reject) => {
        try {
          const nowMoment = moment();
          const appointments: IAppointment[] = await Appointment.find({
            status: AppointmentStatus.APPROVED,
            $and: [
              { doctorReminded: false },
              { patientReminded: false },
              { time: { $gte: nowMoment } },
            ],
          })
            .populate('doctor user')
            .lean<IAppointment[]>()
            .exec();
          for (const appointment of appointments) {
            const appointmentMoment = moment(appointment.time);
            const difference = appointmentMoment.diff(nowMoment, 'minutes');
            // console.log(
            //   `\n\n\n>>> Appointment: ${appointment._id}, time: ${appointment.time}, difference: ${difference}\n\n\n`
            // );
            const alert =
              difference === 30 || difference === 15 || difference === 5;
            const alertComplete = difference === 5;
            if (!alert) continue;
            const user: IUser = appointment.user as IUser,
              doctor = appointment.doctor as IUser;
            await Appointment.findByIdAndUpdate(appointment._id, {
              $set: {
                doctorReminded: alertComplete,
                patientReminded: alertComplete,
              },
            }).exec();
            new NotificationService().sendNotification(
              {
                title: 'Appointment reminder',
                content: `Remember your appointment with ${getPractitionerTypeDisplayName(
                  appointment.consultationType
                )} ${doctor.firstName}  on ${appointmentMoment.format(
                  'h:mma dddd'
                )}`,
                tag: NotificationTag.APPOINTMENT_REMINDER,
                group: NotificationGroup.APPOINTMENT_REMINDER,
                importance: NotificationImportance.HIGH,
                strategy: NotificationStrategy.PUSH_ONLY,
                userId: user._id,
                role: UserRole.PATIENT,
              },
              NotificationStrategy.PUSH_ONLY,
              false
            );
            new NotificationService().sendNotification(
              {
                title: 'Appointment reminder',
                content: `Remember your appointment with ${
                  user.firstName
                } on ${appointmentMoment.format('h:mma dddd')}`,
                tag: NotificationTag.APPOINTMENT_REMINDER,
                group: NotificationGroup.APPOINTMENT_REMINDER,
                importance: NotificationImportance.HIGH,
                strategy: NotificationStrategy.PUSH_ONLY,
                userId: doctor._id,
                role: UserRole.DOCTOR,
              },
              NotificationStrategy.PUSH_ONLY,
              false
            );
          }
        } catch (e) {
          reject(e);
        }
      }).catch((err) => {
        console.error('Error checking for approaching appointments: ', err);
      });
    });
    task.start();
  }
}
