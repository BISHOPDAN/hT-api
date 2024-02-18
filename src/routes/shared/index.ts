import { Router } from 'express';
import { authRoute } from './auth';
import { appointmentsRoute } from './appointments';
import { authenticator } from '../middlewares/authenticator';
import { dashboardRoute } from './dashboard';
import { notificationsRoute } from './notifications';
import { profilesRoute } from './profiles';
import { subscriptionsRoute } from './subscriptions';
import { paymentsRoute } from './payments';
import { chatMessagesRoute } from './chatMessages';
import { doctorDocumentTemplateRoute } from '../admins/doctorDocumentTemplate';
import { walletRoute } from './wallets';
import { mentalAssessmentRoute } from './mentalAssessment';
import { healthGuidesRoute } from './healthGuides';
import { personalHealthQueryRoute } from './personalHealthQuery';
import { healthChoicesRoute } from './healthChoices';
import { fitnessExerciseGroupsRoute } from './fitnessExerciseGroups';
import { fitnessPlansRoute } from './fitnessPlans';
import { fitnessExercisesRoute } from './fitnessExercises';
import { nutritionGuidesRoute } from './fitnessGuides';
import { periodDataRoute } from './periodData';

export const sharedRoute = Router();

sharedRoute.use('/auth', authRoute);

sharedRoute.use(authenticator);

sharedRoute.use('/appointments', appointmentsRoute);
sharedRoute.use('/dashboard', dashboardRoute);
sharedRoute.use('/notifications', notificationsRoute);
sharedRoute.use('/profiles', profilesRoute);
sharedRoute.use('/subscriptions', subscriptionsRoute);
sharedRoute.use('/payments', paymentsRoute);
sharedRoute.use('/chat_messages', chatMessagesRoute);
sharedRoute.use('/doctor_document_templates', doctorDocumentTemplateRoute);
sharedRoute.use('/wallets', walletRoute);
sharedRoute.use('/mental_assessment', mentalAssessmentRoute);
sharedRoute.use('/health_choices', healthChoicesRoute);
sharedRoute.use('/health_guides', healthGuidesRoute);
sharedRoute.use('/personal_health_queries', personalHealthQueryRoute);
sharedRoute.use('/fitness_exercise_groups', fitnessExerciseGroupsRoute);
sharedRoute.use('/fitness_plans', fitnessPlansRoute);
sharedRoute.use('/fitness_exercises', fitnessExercisesRoute);
sharedRoute.use('/nutrition_guides', nutritionGuidesRoute);
sharedRoute.use('/period_data', periodDataRoute);
