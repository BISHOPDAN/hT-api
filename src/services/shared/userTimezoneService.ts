import { BaseService } from '../baseService';
import { ModelName } from '../../models/enums/modelName';
import { IUserTimezone } from '../../models/userTimezone';

export class UserTimezoneService extends BaseService<IUserTimezone> {
  constructor() {
    super(ModelName.USER_TIMEZONE);
  }

  async create(body: IUserTimezone): Promise<IUserTimezone> {
    return super.create(body);
  }
}
