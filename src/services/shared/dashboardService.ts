import { UserRole } from '../../models/enums/userRole';
import { createError } from '../../utils/response';
import { IAppointment } from '../../models/appointment';
import { AppointmentService } from './appointmentService';
import { UserSubscriptionService } from './userSubscriptionService';
import { IUserSubscription } from '../../models/userSubscription';
import { AppointmentStatus } from '../../models/enums/appointmentStatus';
import { UserService } from './userService';

export class DashboardService {
  public async loadDashboard(
    role: UserRole,
    user: string
  ): Promise<IUserDashboard | IDoctorDashboard> {
    switch (role) {
      case UserRole.PATIENT:
        return await DashboardService.loadUserDashboard(user);
      case UserRole.DOCTOR:
        return await DashboardService.loadDoctorDashboard(user);
      default:
        throw createError(`Unsupported role '${role}'`, 400);
    }
  }

  private static async loadUserDashboard(
    user: string
  ): Promise<IUserDashboard> {
    console.log('Loading user dashboard');
    const appointments = await new AppointmentService().getAppointments(
      user,
      UserRole.PATIENT,
      '5'
    );
    const userSubscription =
      await new UserSubscriptionService().getUserSubscription(user, false);
    const hasActiveSubscription =
      await new UserSubscriptionService().checkHasActiveSubscription(user);
    return { appointments, userSubscription, hasActiveSubscription };
  }

  private static async loadDoctorDashboard(
    user: string
  ): Promise<IDoctorDashboard> {
    console.log('Loading doctor dashboard');
    const appointmentService = new AppointmentService();
    const userObj = await new UserService().getUser(user);
    const bookingsOnQueue = await appointmentService.countByStatus(
      user,
      userObj.practitionerTypes,
      AppointmentStatus.PENDING
    );
    const runningBookings = await appointmentService.countByStatus(
      user,
      userObj.practitionerTypes,
      AppointmentStatus.APPROVED,
      AppointmentStatus.STARTED
    );
    const completedBookings = await appointmentService.countByStatus(
      user,
      userObj.practitionerTypes,
      AppointmentStatus.COMPLETED
    );
    return { bookingsOnQueue, runningBookings, completedBookings };
  }
}

export interface IUserDashboard {
  appointments: IAppointment[];
  userSubscription: IUserSubscription;
  hasActiveSubscription: Boolean;
}

export interface IDoctorDashboard {
  bookingsOnQueue: number;
  runningBookings: number;
  completedBookings: number;
}
