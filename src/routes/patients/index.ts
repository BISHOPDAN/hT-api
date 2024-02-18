import { Router } from 'express';
import { adminGuard } from '../middlewares/adminGuard';
import { sharedRoute } from '../shared';
import { authenticator } from '../middlewares/authenticator';
import { periodTrackerRoute } from './periodTracker';
import { mentalHealthRoute } from './mentalHealth';
import { userFitnessRoute } from './userFitness';
import { bloodPressureRoute } from './bloodPressure';
import { bloodTestRoute } from './bloodTest';
import { surgicalHistoryRoute } from './surgicalHistory';
import { bloodGlugoseRoute } from './bloodGlucose';
import { radiologyRoute } from './radiology';
import { allergyRoute } from './allergy';
import { currentMedRoute } from './currentMed';
import { chronicConditionRoute } from './chronicCondition';
import { pathologyRoute } from './pathology';


export const patientRoute = Router();

patientRoute.use('/period_tracker', periodTrackerRoute);
patientRoute.use('/mental_health', mentalHealthRoute);
patientRoute.use('/user_fitness',userFitnessRoute)
patientRoute.use('/medical_record/blood_pressure',bloodPressureRoute)
patientRoute.use('/medical_record/blood_test',bloodTestRoute)
patientRoute.use('/medical_record/surgical_history',surgicalHistoryRoute)
patientRoute.use('/medical_record/blood_glucose',bloodGlugoseRoute)
patientRoute.use('/medical_record/radiology',radiologyRoute)
patientRoute.use('/medical_record/allergy',allergyRoute)
patientRoute.use('/medical_record/current_medication',currentMedRoute)
patientRoute.use('/medical_record/chronic_condition',chronicConditionRoute)
patientRoute.use('/medical_record/pathology',pathologyRoute)

