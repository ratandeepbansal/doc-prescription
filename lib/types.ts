export interface Suggestion {
  id: string;
  text: string;
  confidence: number; // 0-1
  category: 'symptom' | 'diagnosis' | 'medicine';
}

export interface ConsultationSession {
  id: string;
  patientName: string;
  startedAt: string;
  recordingDuration: number; // in seconds (max 300)
  transcription: string;
  suggestions: {
    symptoms: Suggestion[];
    diagnoses: Suggestion[];
    medicines: Suggestion[];
  };
  selectedItems: {
    symptoms: string[];
    diagnoses: string[];
    medicines: string[];
  };
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  specialInstructions: string;
}

export interface Prescription {
  id: string;
  consultationSessionId: string;
  patientName: string;
  date: string;
  doctorNotes: string;
  symptoms: string[];
  diagnosis: string[];
  medicines: Medicine[];
  additionalNotes: string;
  generatedAt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
}
