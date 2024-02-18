export interface IAdminDashboardResult {
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  totalDermatologistSubscriptionPayment: number;
  totalFitnessCoachSubscriptionPayment: number;
  totalPatientsForPeriod: number;
  totalSubscriptionPayment;
  totalDoctorSubscriptionPayment;
  totalTherapistSubscriptionPayment;
  totalFreeTrialSubscriptionPayment;
  genderDemoGraphic: IGenderDemographic[];
  customGenderDemoGraphic: IGenderDemographic[];
}

export interface IGenderDemographic {
  month?: number;
  dayOfWeek?: number;
  genderScores: IGenderScore[];
}

export interface IGenderScore {
  dayOfWeek?: number;
  month?: number;
  gender: string;
  count: number;
}
