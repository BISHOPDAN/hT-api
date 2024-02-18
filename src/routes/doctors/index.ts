import { Router } from 'express';
import { documentsRoute } from './documents';
import { authenticator } from '../middlewares/authenticator';
import { doctorRoleGuard } from '../middlewares/doctorRoleGuard';

export const doctorsRoute = Router();

doctorsRoute.use(authenticator);
doctorsRoute.use(doctorRoleGuard);

doctorsRoute.use('/documents', documentsRoute);
