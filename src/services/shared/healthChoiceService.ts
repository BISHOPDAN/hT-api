import { BaseService } from '../baseService';
import { IHealthChoice } from '../../models/health-choice-item.schema';
import { ModelName } from '../../models/enums/modelName';

export class HealthChoiceService extends BaseService<IHealthChoice> {
  constructor() {
    super(ModelName.HEALTH_CHOICE);
  }

  async create(body: IHealthChoice): Promise<IHealthChoice> {
    return super.create(body);
  }

  async createMulti(
    body: IHealthChoice & { titles: string[] }
  ): Promise<IHealthChoice[]> {
    const savedHealthChoices: IHealthChoice[] = [];
    for (const title of body.titles) {
      const healthChoice = Object.assign(body, { title });
      savedHealthChoices.push(await super.create(healthChoice));
    }
    return savedHealthChoices;
  }
}
