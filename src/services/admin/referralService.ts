import { IReferral, Referral } from '../../models/referral';
import { charset, generate } from 'voucher-code-generator';
import { createError } from '../../utils/response';
import { FilterQuery } from 'mongoose';
import { IUser, User } from '../../models/user';
import { buildPaginationOptions, stripUpdateFields } from '../../utils/utils';
import { Appointment } from '../../models/appointment';
import { ObjectId } from 'mongodb';
import { raw } from 'express';

export class ReferralService {
  public async createReferral(body: IReferral): Promise<IReferral> {
    if (!body.name) throw createError('Name is required', 400);
    if (!body.email) throw createError('Email address is required', 400);
    let referral = await Referral.findOne({ email: body.email })
      .lean<IReferral>()
      .exec();
    if (referral) return referral;
    body.code = generate({
      pattern: '###-###',
      charset: charset('alphabetic'),
      count: 1,
    })[0].toUpperCase();
    return await new Referral(body).save();
  }

  public async createReferralCodeForUser(user: IUser): Promise<IReferral> {
    return await this.createReferral({
      name: `ref-${user.firstName}-${user.lastName}`,
      email: user.email,
    } as IReferral);
  }

  public async updateReferral(id: string, body: IReferral): Promise<IReferral> {
    stripUpdateFields(body);
    delete body.users;
    console.log('>>> Updating referral: ', body);
    return await Referral.findOneAndUpdate(
      {
        $or: [{ _id: id }, { code: id }],
      },
      body,
      { new: true }
    )
      .lean<IReferral>()
      .exec();
  }

  public async getReferral(id: string): Promise<IReferral> {
    const referral = await Referral.findById(id)
      .populate('users')
      .lean<IReferral>()
      .exec();
    if (!referral) throw createError('Referral not found');
    return referral;
  }

  public async deleteReferral(id: string): Promise<IReferral> {
    const referral = await Referral.findOneAndDelete({
      $or: [{ _id: id }, { code: id }],
    })
      .lean<IReferral>()
      .exec();
    if (!referral) throw createError('Referral not found');
    return referral;
  }

  public async getReferrals(req: any): Promise<IReferral[]> {
    const filter: FilterQuery<IReferral> = {};
    if (req.query.email) filter.email = req.query.email;
    if (req.query.name) filter.name = req.query.name;
    if (req.query.code) filter.code = req.query.code;
    if (req.query.userIds) {
      const users: ObjectId[] = (req.query.userIds as string)
        .split('|')
        .map((value) => new ObjectId(value));
      Object.assign(filter, { users: { $in: users } });
    }
    const paginateOptions = buildPaginationOptions(
      filter,
      'createdAt',
      Object.assign(req, { sortAscending: false })
    );
    const data = await (Referral as any).paginate(paginateOptions);
    // data.results = await Referral.populate(data.results, {path: 'users'});
    // return Referral.find().populate('users').lean<IReferral[]>().exec()
    return data;
  }

  public async getUserReferee(user: string): Promise<IReferral> {
    return await Referral.findOne({ users: { $in: user } }).exec();
  }
}
