import { Router } from 'express';
import { sharedRoute } from './shared';
import { routeGuard } from './middlewares/routeGuard';
import { adminRoute } from './admins';
import { doctorsRoute } from './doctors';
import { externalPaymentsRoute } from './shared/external_payments';
import { patientRoute } from './patients';

export const app = Router();

app.use('/external/payments', externalPaymentsRoute);

app.use(routeGuard);

app.use(sharedRoute);

app.use('/admins', adminRoute);
app.use('/doctors', doctorsRoute);
app.use('/patients', patientRoute);