import { IReferral, Referral } from '../../models/referral';
import { createError } from '../../utils/response';
import { IUser, User } from '../../models/user';
import { ReferralService as AdminReferralService } from '../admin/referralService';

export class ReferralService {
  public async createReferralCodeForUser(user: IUser): Promise<IReferral> {
    const referral = await new AdminReferralService().createReferral({
      name: `ref-${user.firstName}-${user.lastName}`,
      email: user.email,
    } as IReferral);

    await User.findOneAndUpdate(
      { email: user.email },
      {
        referralCode: referral.code,
      }
    );
    return referral;
  }

  public applyReferralCode(user: string, code: string) {
    code = code.toUpperCase();
    new Promise(async (accept, reject) => {
      try {
        const referral = await Referral.findOne({ code })
          .lean<IReferral>()
          .exec();
        if (!referral) reject(createError('Referral not found', 400));
        accept(
          await Referral.findByIdAndUpdate(referral._id, {
            $addToSet: { users: user },
          }).exec()
        );
      } catch (e) {
        reject(e);
      }
    }).catch((err) => {
      console.error('Apply referral error: ', err);
    });
  }

  public static createReferralCodesForUsers() {
    new Promise(async (accept, reject) => {
      const users: IUser[] = await User.find().lean<IUser[]>().exec();
      const referralService = new ReferralService();
      for (const user of users) {
        console.log(`>>> Creating referral for user: ${user.firstName}`);
        await referralService.createReferralCodeForUser(user);
      }
    }).catch((err) => {
      console.error(err);
    });
  }
}
