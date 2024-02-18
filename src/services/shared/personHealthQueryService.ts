import { BaseService } from '../baseService';
import { IPersonalHealthQuery } from '../../models/personalHealthQuery';
import { ModelName } from '../../models/enums/modelName';
import { getUpdateOptions, stripUpdateFields } from '../../utils/utils';
import { HealthEntity } from '../../models/enums/health-choice-entity.enum';
import { FitnessPlanService } from './fitnessPlanService';
import { PeriodDataService } from './periodDataService';
import { FitnessPlanType } from '../../models/fitnessPlan';

export class PersonalHealthQueryService extends BaseService<IPersonalHealthQuery> {
  private readonly fitnessPlanService: FitnessPlanService;
  private readonly periodDataService: PeriodDataService;

  constructor() {
    super(ModelName.PERSONAL_HEALTH_QUERY);
    this.fitnessPlanService = new FitnessPlanService();
    this.periodDataService = new PeriodDataService();
  }

  async _createWithUser(
    user: string,
    body: IPersonalHealthQuery,
    timezone
  ): Promise<IPersonalHealthQuery> {
    const entity = body.entity;
    stripUpdateFields(body);
    const result = await super.updateByOne(
      { user, entity },
      body,
      getUpdateOptions()
    );
    if (result.entity === HealthEntity.GENERAL_FITNESS_PLAN) {
      await this.fitnessPlanService._create(FitnessPlanType.GENERAL, result);
    } else if (result.entity === HealthEntity.PERSONAL_FITNESS_PLAN) {
      await this.fitnessPlanService._create(FitnessPlanType.PERSONAL, result);
    } else if (result.entity === HealthEntity.PERIOD_TRACKER) {
      await this.periodDataService._create(user, body.responses, timezone);
    }
    return result;
  }
}
