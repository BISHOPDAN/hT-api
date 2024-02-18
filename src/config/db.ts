import * as mongoose from 'mongoose';
import { connect, ConnectOptions } from 'mongoose';
import { config } from './config';
import { ModelName } from '../models/enums/modelName';
import { healthGuideSchema } from '../models/healthGuide';
import { personalHealthQuerySchema } from '../models/personalHealthQuery';
import { healthChoiceSchema } from '../models/health-choice-item.schema';
import { fitnessExerciseGroupSchema } from '../models/fitnessExerciseGroup';
import { fitnessPlanSchema } from '../models/fitnessPlan';
import { fitnessExerciseSchema } from '../models/fitnessExercise';
import { nutritionGuideSchema } from '../models/nutritionGuide';
import { periodDataSchema } from '../models/periodData';
import { userTimeZoneSchema } from '../models/userTimezone';

export class Db {
  async connectDb(): Promise<boolean> {
    const mongoUrl = config.mongoDbUrl;
    console.log('>>> Connecting to db instance: ', mongoUrl);
    return new Promise<boolean>((accept, reject) => {
      connect(mongoUrl, {} as ConnectOptions)
        .then((_) => {
          console.log('>>> Db connected: ');
          mongoose.set('debug', config.environment !== 'production');
          accept(true);
        })
        .catch((err) => {
          console.error('Db connection error: ', err);
          reject(err);
        });
    });
  }

  registerModels() {
    mongoose.model(ModelName.HEALTH_CHOICE, healthChoiceSchema);
    mongoose.model(ModelName.HEALTH_GUIDE, healthGuideSchema);
    mongoose.model(ModelName.PERSONAL_HEALTH_QUERY, personalHealthQuerySchema);
    mongoose.model(
      ModelName.FITNESS_EXERCISE_GROUP,
      fitnessExerciseGroupSchema
    );
    mongoose.model(ModelName.FITNESS_PLAN, fitnessPlanSchema);
    mongoose.model(ModelName.FITNESS_EXERCISE, fitnessExerciseSchema);
    mongoose.model(ModelName.NUTRITION_GUIDE, nutritionGuideSchema);
    mongoose.model(
      ModelName.PERIOD_DATA,
      periodDataSchema,
      ModelName.PERIOD_DATA
    );
    mongoose.model(ModelName.USER_TIMEZONE, userTimeZoneSchema);
  }
}
