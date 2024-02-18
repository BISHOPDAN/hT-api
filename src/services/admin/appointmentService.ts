import { Appointment, IAppointment } from '../../models/appointment';
import { buildPaginationOptions } from '../../utils/utils';
import { createError } from '../../utils/response';
import { FilterQuery } from 'mongoose';
import { User } from '../../models/user';
import { ObjectId } from 'mongodb';
import moment from 'moment/moment';
import * as util from 'util';
import { schedule } from 'node-cron';
import { FcmToken } from '../../models/fcmToken';

export class AppointmentService {
  public async getAppointments(req): Promise<IAppointment[]> {
    const filter: FilterQuery<IAppointment> = {};
    const query = req.query;
    if (query.status) filter.status = query.status;
    if (query.meansOfContact) filter.meansOfContact = query.meansOfContact;
    if (query.consultationType)
      filter.consultationType = query.consultationType;
    if (query.searchQuery) {
      const userIds: string[] = await User.find({
        $or: [
          { firstName: { $regex: query.searchQuery, $options: 'i' } },
          { lastName: { $regex: query.searchQuery, $options: 'i' } },
          { email: { $regex: query.searchQuery, $options: 'i' } },
        ],
      })
        .distinct('_id')
        .exec();
      Object.assign(filter, {
        $or: [{ user: { $in: userIds } }, { doctor: { $in: userIds } }],
      });
      console.log('User ids: ', userIds);
    }
    if (query.user_id) {
      const userId = new ObjectId(query.user_id);
      Object.assign(filter, {
        $or: [{ user: userId }, { doctor: userId }],
      });
    }
    if (query.startDate && query.endDate) {
      const startDateMoment = moment(query.startDate, 'YYYY-MM-DD', true)
        .utc(true)
        .startOf('day');
      const endDateMoment = moment(query.endDate, 'YYYY-MM-DD', true)
        .utc(true)
        .endOf('day');
      Object.assign(filter, {
        $and: [
          {
            createdAt: {
              $gte: moment(query.startDate, 'YYYY-MM-DD', true).toDate(),
            },
          },
          // {createdAt: {$lte: moment(query.endDate, 'YYYY-MM-DD', true).toDate()}}
        ],
      });
    }
    console.log(
      '>>> Get appointment filter: ',
      util.inspect(filter, true, 5, false)
    );
    if (query.startDate && query.endDate) {
      const data = {} as any;
      data.results = await Appointment.find(filter)
        .sort({ createdAt: 'desc' })
        .populate('user doctor')
        .exec();
      return data;
    } else {
      const paginateOptions = buildPaginationOptions(
        filter,
        'createdAt',
        Object.assign(req, { sortAscending: false })
      );
      const data = await (Appointment as any).paginate(paginateOptions);
      data.results = await Appointment.populate(data.results, {
        path: 'user doctor',
      });
      return data;
    }
  }

  public async getAppointment(id: string): Promise<IAppointment> {
    const appointment: IAppointment = await Appointment.findById(id)
      .populate('user doctor')
      .lean<IAppointment>()
      .exec();
    if (!appointment) throw createError('Appointment not found', 404);
    return appointment;
  }

  public async getStats(req: any): Promise<{ count: number; status: string }> {
    const status = req.query.status;
    const filterQuery: FilterQuery<IAppointment> = {};
    if (status) filterQuery.status = status;
    const count = await Appointment.countDocuments(filterQuery).exec();
    return { count, status };
  }

  public static beginCheckForDueAppointments() {
    const task = schedule('0 0 0 * * *', () => {
      console.log('Checking due appointments');
      new Promise(async (accept, reject) => {
        try {
          const fcmTokens: string[] = await FcmToken.find()
            .distinct('token')
            .lean<string[]>()
            .exec();
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
