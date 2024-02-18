import { Router } from 'express';
import { adminGuard } from '../middlewares/adminGuard';
import { sharedRoute } from '../shared';
import { authenticator } from '../middlewares/authenticator';
import { usersRoute } from './users';
import { dashboardRoute } from './dashboard';
import { appointmentsRoute } from './appointments';
import { subscriptionsRoute } from './subscriptions';
import { referralsRoute } from './referrals';
import { broadcastMessagesRoute } from './broadcastMessages';
import { userMessagesRoute } from './userMessages';
import { queuesRoute } from './queues';
import { questionRoute } from './questions';
import { fitnessRoute } from './fitness';
import { walletRoute } from './wallet';
import { mentalAssessmentRoute } from './mentalAssessment';

export const adminRoute = Router();

adminRoute.use(authenticator);
adminRoute.use(adminGuard);

adminRoute.use('/dashboard', dashboardRoute);
adminRoute.use('/users', usersRoute);
adminRoute.use('/appointments', appointmentsRoute);
adminRoute.use('/subscriptions', subscriptionsRoute);
adminRoute.use('/referrals', referralsRoute);
adminRoute.use('/broadcast_messages', broadcastMessagesRoute);
adminRoute.use('/user_messages', userMessagesRoute);
adminRoute.use('/queues', queuesRoute);
adminRoute.use('/question', questionRoute);
adminRoute.use('/fitness', fitnessRoute);
adminRoute.use('/wallet', walletRoute);
adminRoute.use('/mental_assessment', mentalAssessmentRoute);

adminRoute.use(sharedRoute);
