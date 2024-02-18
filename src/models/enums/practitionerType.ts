export enum PractitionerType {
  DOCTOR = 'doctor',
  THERAPIST = 'therapist',
  DERMATOLOGIST = 'dermatologist',
  FITNESS_COACH = 'fitness_coach',
  FERTILITY_EXPERT = 'fertility_expert',
}

export const validatePractitionerType = (type: PractitionerType): boolean => {
  return Object.values(PractitionerType).includes(type);
};

export const getPractitionerTypeDisplayName = (
  practitionerType: PractitionerType
): string => {
  switch (practitionerType) {
    case PractitionerType.DOCTOR:
      return 'Doctor';
    case PractitionerType.THERAPIST:
      return 'Therapist';
    case PractitionerType.DERMATOLOGIST:
      return 'Dermatologist';
    case PractitionerType.FITNESS_COACH:
      return 'Coach';
    case PractitionerType.FERTILITY_EXPERT:
      return 'Fertility Expert';
  }
};
