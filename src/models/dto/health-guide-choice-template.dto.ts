import { HealthEntity } from '../enums/health-choice-entity.enum';
import { HealthChoiceItem } from '../enums/health-choice-item.enum';
import { IHealthChoice } from '../health-choice-item.schema';

export interface HealthGuideChoiceTemplateDto {
  id: string;
  title: string;
  entity: HealthEntity;
  item: HealthChoiceItem;
  singleSelection: boolean;
  responses: [];
  choices?: IHealthChoice[];
}
