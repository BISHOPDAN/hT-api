export enum GeneralResponse {
  Yes = 'yes',
  No = 'No',
  Maybe = 'Maybe',
  I_dont_know = 'I_dont_know',
}

export enum WorriesResponse {
  Your_Health = 'Your_Health', // Your health
  Your_Weight_Or_Looks = 'Your_Weight_Or_Looks',  // Your weight or how you look
  Sexual_disire = 'Sexual_disire', // Little or no sexual desire or pleasure during sex
  Partner_difficulty = 'Partner_difficulty', // Difficulties with your partner
  Family_stress = 'Family_stress', // The stress of taking care of family members
  Work_stress = 'Work_stress', // Stress at work, school or outside home
  Financial_Problem = 'Financial_Problem', //By financial problems or worries
  Support_issue = 'Support_issue', // Having no one to turn to
  Recent_Accident = 'Recent_Accident' // Something bad that happened recently

}


export enum QuestionType {
    Health_Assessment = 'Health_Assessment',
    Fitness = 'Fitness'
  }

export enum Status {
    Active = 'Active',
    Inactive = 'Inactive'
  }

  export enum AuthProvider {
    AEGLE = 'aegle',
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
  }
  
  export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    NIL = 'nil',
  }

  export enum GlucoseTestType {
    Fasting = 'Fasting',
    Postprandal = 'Postprandal',
  }

  export enum MedicationType {
    Current = 'Current',
    Past = 'Past',
  }
  