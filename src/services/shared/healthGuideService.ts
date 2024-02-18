import { BaseService } from '../baseService';
import { IHealthGuide } from '../../models/healthGuide';
import { ModelName } from '../../models/enums/modelName';
import { HealthEntity } from '../../models/enums/health-choice-entity.enum';
import { HealthGuideChoiceTemplateDto } from '../../models/dto/health-guide-choice-template.dto';
import { HealthChoiceItem } from '../../models/enums/health-choice-item.enum';
import { createError } from '../../utils/response';
import { v1 } from 'uuid';
import { HealthChoiceService } from './healthChoiceService';
import { IHealthChoice } from '../../models/health-choice-item.schema';
import { FilterQuery } from 'mongoose';

export class HealthGuideService extends BaseService<IHealthGuide> {
  private healthChoiceService: HealthChoiceService;

  constructor() {
    super(ModelName.HEALTH_GUIDE);
    this.healthChoiceService = new HealthChoiceService();
  }

  async create(body: IHealthGuide): Promise<IHealthGuide> {
    return super.create(body);
  }

  async getHealthGuideTemplates(
    entity: HealthEntity,
    tags: string = null
  ): Promise<HealthGuideChoiceTemplateDto[]> {
    const supportedEntities = Object.values(HealthEntity);
    if (!supportedEntities.includes(entity))
      throw createError(
        `Entity must be one of '${supportedEntities.join(',')}'`,
        400
      );
    let result: HealthGuideChoiceTemplateDto[];
    switch (entity) {
      case HealthEntity.NUTRITION_GUIDE:
        result = await this.getNutritionGuideTemplates();
        break;
      case HealthEntity.GENERAL_FITNESS_PLAN:
        result = await this.getGeneralFitnessGuideTemplates();
        break;
      case HealthEntity.PERSONAL_FITNESS_PLAN:
        result = await this.getPersonalFitnessGuideTemplates();
        break;
      case HealthEntity.HEALTH_CHECK:
        result = await this.getHealthCheckGuideTemplates();
        break;
      case HealthEntity.PERIOD_TRACKER:
        result = await this.getPeriodTrackerTemplates();
        break;
    }
    if (result) {
      for (const resultItem of result) {
        resultItem.choices = await this.getHealthChoices(
          entity,
          resultItem.item,
          tags
        );
      }
    }
    return result || [];
  }

  private async getNutritionGuideTemplates(): Promise<
    HealthGuideChoiceTemplateDto[]
  > {
    const entity = HealthEntity.NUTRITION_GUIDE;
    return [
      {
        id: v1().toString(),
        title: 'What are your health goals?',
        entity,
        item: HealthChoiceItem.HEALTH_GOAL,
        singleSelection: false,
        responses: [],
      },
      {
        id: v1().toString(),
        title: 'If you have any existing conditions please select',
        entity,
        item: HealthChoiceItem.HEALTH_CONDITION,
        singleSelection: false,
        responses: [],
      },
      {
        id: v1().toString(),
        title: 'What is your physical activity level?',
        entity,
        item: HealthChoiceItem.PHYSICAL_ACTIVITY_LEVEL,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title: 'What are your dietary preferences & restrictions?',
        entity,
        item: HealthChoiceItem.DIETARY_PREFERENCE,
        singleSelection: false,
        responses: [],
      },
      {
        id: v1().toString(),
        title: 'Click these symptoms if you have any?',
        entity,
        item: HealthChoiceItem.SYMPTOMS,
        singleSelection: false,
        responses: [],
      },
    ];
  }

  private async getGeneralFitnessGuideTemplates(): Promise<
    HealthGuideChoiceTemplateDto[]
  > {
    const entity = HealthEntity.GENERAL_FITNESS_PLAN;
    return [
      {
        id: v1().toString(),
        title: 'What is your favorite food?',
        entity,
        item: HealthChoiceItem.FAVORITE_FOOD,
        singleSelection: false,
        responses: [],
      },
      {
        id: v1().toString(),
        title: 'What is your gender?',
        entity,
        item: HealthChoiceItem.GENDER,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title: 'Please choose your area of focus',
        entity,
        item: HealthChoiceItem.FITNESS_FOCUS_AREA,
        singleSelection: true,
        responses: [],
      },
    ];
  }

  private async getPersonalFitnessGuideTemplates(): Promise<
    HealthGuideChoiceTemplateDto[]
  > {
    const entity = HealthEntity.PERSONAL_FITNESS_PLAN;
    return [
      {
        id: v1().toString(),
        title:
          'Do you have any existing medical conditions, such as heart disease, diabetes, or high blood pressure?',
        entity,
        item: HealthChoiceItem.YES_NO,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title:
          'Have you ever had a serious injury or surgery that might affect your ability to exercise safely?',
        entity,
        item: HealthChoiceItem.YES_NO,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title:
          'Do you experience chest pain or discomfort during physical activity?',
        entity,
        item: HealthChoiceItem.YES_NO_MAYBE,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title:
          'Have you ever been told by a healthcare professional that you have a heart condition or other cardiovascular issues?',
        entity,
        item: HealthChoiceItem.YES_NO,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title:
          'Are you currently taking any medications that could impact your ability to engage in strenuous physical activity?',
        entity,
        item: HealthChoiceItem.YES_NO,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title:
          'Do you have any concerns or doubts about your ability to safely participate in an exercise program?',
        entity,
        item: HealthChoiceItem.YES_NO_MAYBE,
        singleSelection: true,
        responses: [],
      },
    ];
  }

  private async getHealthCheckGuideTemplates(): Promise<
    HealthGuideChoiceTemplateDto[]
  > {
    const entity = HealthEntity.HEALTH_CHECK;
    return [
      {
        id: v1().toString(),
        title: 'How would you describe your overall mood today?',
        entity,
        item: HealthChoiceItem.MOOD,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title: 'On a scale of 1 to 10, how well-rested do you feel today?',
        entity,
        item: HealthChoiceItem.FEELING_SCALE,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title:
          "Do you have any specific concerns or symptoms you'd like to share today?",
        entity,
        item: HealthChoiceItem.CONCERNS_OR_SYMPTOMS,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title:
          "Are there any changes in your health or well-being that you've noticed since yesterday?",
        entity,
        item: HealthChoiceItem.HEALTH_CHANGES,
        singleSelection: true,
        responses: [],
      },
    ];
  }

  private async getPeriodTrackerTemplates(): Promise<
    HealthGuideChoiceTemplateDto[]
  > {
    const entity = HealthEntity.PERIOD_TRACKER;
    return [
      {
        id: v1().toString(),
        title:
          'Is your menstrual cycle regular(varies by no more than 7 days?)',
        entity,
        item: HealthChoiceItem.MENSTRUAL_CYCLE_REGULARITY,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title: 'Do you experience discomfort due to any of the following?',
        entity,
        item: HealthChoiceItem.MENSTRUAL_CYCLE_DISCOMFORT,
        singleSelection: true,
        responses: [],
      },
      {
        id: v1().toString(),
        title:
          'Do you have any reproductive health disorders (endometriosis, PCOS, etc.?)',
        entity,
        item: HealthChoiceItem.REPRODUCTIVE_HEALTH_DISORDERS,
        singleSelection: true,
        responses: [],
      },
    ];
  }

  private async getHealthChoices(
    entity: HealthEntity,
    item: HealthChoiceItem,
    tags: string = null
  ): Promise<IHealthChoice[]> {
    const filter: FilterQuery<IHealthChoice> = {
      parentEntities: entity,
      item,
    };
    if (tags) {
      filter.tags = { $in: tags };
    }
    return await this.healthChoiceService.find(filter);
  }
}
