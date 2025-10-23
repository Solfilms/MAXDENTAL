export type Lang = "es" | "en";

export type Consents = {
  broken: boolean;
  hipaa: boolean;
  financial: boolean;
};

export type WomenFlags = { 
  pregnant: boolean; 
  nursing: boolean; 
  bcp: boolean 
};

export type IntakePayload = {
  lang: Lang;
  // Tipo de paciente
  patientType: 'new' | 'existing' | null;
  // Información personal completa
  lastName: string;
  firstName: string;
  middleInitial?: string;
  socialSecurityNumber?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  homePhone: string;
  cellPhone?: string;
  email: string;
  sex: "M" | "F";
  age?: string;
  birthdate: string;
  maritalStatus: string;
  occupation: string;
  employer: string;
  workAddress?: string;
  workPhone?: string;
  workEmail?: string;
  referralSource?: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyWorkPhone?: string;
  emergencyEmail?: string;
  
  // Información del seguro
  insurance?: string;
  insuranceId?: string;
  insuranceGroup?: string;
  subscriber?: string;
  insuranceOther?: string;
  
  // Preferencias
  marketing: string;
  referredBy?: string;
  marketingOther?: string;
  contactPref: string;
  visitType: string;
  dayPref?: string;
  timePref?: string;
  notes?: string;
  
  // Historial médico - todas las preguntas con Sí/No
  medicalHistory: Record<string, "Yes" | "No">;
  medications?: string;
  drugAllergies?: string;
  bloodTransfusion?: boolean;
  bloodTransfusionDates?: string;
  fenPhenRedux?: boolean;
  bisphosphonates?: boolean;
  
  // Información específica para mujeres
  women: WomenFlags;
  
  // Consentimientos
  consentsAccepted: Consents;
  
  // Firma única para todos los documentos
  signatureDataUrl: string;
  
  meta?: { 
    source: string; 
    submittedAt: string; 
    tz: string; 
    ua: string 
  };
};
