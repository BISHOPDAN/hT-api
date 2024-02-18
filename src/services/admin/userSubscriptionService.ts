import {
  IUserSubscription,
  UserSubscription,
} from '../../models/userSubscription';

type PaginationFilterType = Partial<{
  limit: string;
  page: string;
  validUtil: string;
}>;
interface IPaginatedDocument<T> {
  data: T;
  totalCount: number;
}

export class UserSubscriptionService {
  async getUserSubscriptions(
    filters: PaginationFilterType = { limit: '10', page: '1' }
  ): Promise<IPaginatedDocument<IUserSubscription>> {
    let query = {};

    if (!!filters?.validUtil)
      Object.assign(query, {
        validUntil: { $gt: new Date(filters?.validUtil) },
      });

    const skip = Math.abs(
      (Math.max(parseInt(filters?.page), 1) - 1) * parseInt(filters?.limit!)
    );

    const [totalCount, data] = await Promise.all([
      UserSubscription.countDocuments(query).exec(),
      UserSubscription.find(query, null, { populate: ['subscription', 'user'] })
        .lean<IUserSubscription>()
        .sort({ createdAt: -1 })
        .limit(Math.abs(parseInt(filters?.limit!)))
        .skip(skip)
        .exec(),
    ]);

    return { totalCount, data };
  }
}
