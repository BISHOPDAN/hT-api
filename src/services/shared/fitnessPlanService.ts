import { BaseService } from '../baseService';
import {
  FitnessPlanLevel,
  FitnessPlanStatus,
  FitnessPlanType,
  IFitnessPlan,
} from '../../models/fitnessPlan';
import { ModelName } from '../../models/enums/modelName';
import {
  IPersonalHealthQuery,
  IPersonalHealthQueryResponse,
} from '../../models/personalHealthQuery';
import { FitnessExerciseGroupService } from './fitnessExerciseGroupService';
import { IFitnessExerciseGroup } from '../../models/fitnessExerciseGroup';
import { getUpdateOptions, userAsString } from '../../utils/utils';
import { IFitnessExercise } from '../../models/fitnessExercise';
import { FitnessExercisesService } from './fitnessExercisesService';
import { FilterQuery } from 'mongoose';

export class FitnessPlanService extends BaseService<IFitnessPlan> {
  private readonly fitnessExerciseGroupService: FitnessExerciseGroupService;
  private readonly fitnessExercisesService: FitnessExercisesService;

  constructor() {
    super(ModelName.FITNESS_PLAN);
    this.fitnessExerciseGroupService = new FitnessExerciseGroupService();
    this.fitnessExercisesService = new FitnessExercisesService();
  }

  async _create(
    type: FitnessPlanType,
    personalHealthQuery: IPersonalHealthQuery
  ): Promise<IFitnessPlan> {
    const user = userAsString(personalHealthQuery.user);
    if (type === FitnessPlanType.PERSONAL) {
      return await super.updateByOne(
        { user, type },
        {
          $set: {
            personalHealthQuery: personalHealthQuery._id.toString(),
          },
        },
        getUpdateOptions()
      );
    } else {
      const level = await this.calculateFitnessLevel(
        personalHealthQuery.responses
      );
      const exerciseGroups = await this.calculateExerciseGroups(
        level,
        personalHealthQuery.responses
      );
      return await super.updateByOne(
        { user, type },
        {
          $set: {
            exerciseGroups,
            level,
            status: FitnessPlanStatus.ACTIVE,
            personalHealthQuery: personalHealthQuery._id.toString(),
          },
        },
        getUpdateOptions()
      );
    }
  }

  private async calculateExerciseGroups(
    level: FitnessPlanLevel,
    responses: IPersonalHealthQueryResponse[]
  ): Promise<IFitnessExerciseGroup[]> {
    const areaOfFocusResponse: IPersonalHealthQueryResponse = responses.find(
      (value) => value.question.includes('area of focus')
    );
    const focusAreas: string[] = areaOfFocusResponse?.answers || [
      'Arm',
      'Full body',
    ];
    // const filter = { title: { $in: focusAreas } };
    const filter = {};
    const fitnessExerciseGroups = await this.fitnessExerciseGroupService.find(
      filter
    );
    for (const exerciseGroup of fitnessExerciseGroups) {
      exerciseGroup.exercises = await this.getExercises(level, exerciseGroup);
    }
    return fitnessExerciseGroups;
  }

  private async getExercises(
    level: FitnessPlanLevel,
    exerciseGroup: IFitnessExerciseGroup
  ): Promise<IFitnessExercise[]> {
    // const filter: FilterQuery<IFitnessExercise> = {
    //   exerciseGroup: exerciseGroup._id.toString(),
    // }
    const filter: FilterQuery<IFitnessExercise> = {};
    let reps = 0,
      sets = 0;
    switch (level) {
      case FitnessPlanLevel.BEGINNER:
        reps = 3;
        sets = 3;
        break;
      case FitnessPlanLevel.INTERMEDIATE:
        reps = 5;
        sets = 5;
        break;
      case FitnessPlanLevel.ADVANCED:
        reps = 10;
        sets = 10;
    }
    return (await this.fitnessExercisesService.find(filter)).map((value) => {
      value.reps = reps;
      value.sets = sets;
      return value;
    });
  }

  private async calculateFitnessLevel(
    responses: IPersonalHealthQueryResponse[]
  ): Promise<FitnessPlanLevel> {
    const numDaysResponse = responses.find((value) =>
      value.question.includes('Number of days')
    );
    const numDays: number = Number(numDaysResponse?.answers[0] || '1');
    if (numDays <= 3) {
      return FitnessPlanLevel.BEGINNER;
    } else if (numDays <= 6) {
      return FitnessPlanLevel.INTERMEDIATE;
    } else {
      return FitnessPlanLevel.ADVANCED;
    }
  }
}
