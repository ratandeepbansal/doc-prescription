import { create } from 'zustand';
import { ConsultationSession } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../services/storage';

interface ConsultationState {
  currentSession: ConsultationSession | null;
  isRecording: boolean;
  
  // Actions
  startSession: (patientName: string) => void;
  stopRecording: () => void;
  updateTranscription: (text: string) => void;
  updateSuggestions: (suggestions: Partial<ConsultationSession['suggestions']>) => void;
  toggleSelection: (category: keyof ConsultationSession['selectedItems'], item: string) => void;
  updateDuration: (duration: number) => void;
  endSession: () => void;
}

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  currentSession: null,
  isRecording: false,

  startSession: (patientName: string) => {
    const session: ConsultationSession = {
      id: uuidv4(),
      patientName,
      startedAt: new Date().toISOString(),
      recordingDuration: 0,
      transcription: '',
      suggestions: {
        symptoms: [],
        diagnoses: [],
        medicines: []
      },
      selectedItems: {
        symptoms: [],
        diagnoses: [],
        medicines: []
      }
    };
    
    storage.saveSession(session);
    set({ currentSession: session, isRecording: true });
  },

  stopRecording: () => {
    set({ isRecording: false });
  },

  updateTranscription: (text: string) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updated = { ...currentSession, transcription: text };
    storage.saveSession(updated);
    set({ currentSession: updated });
  },

  updateSuggestions: (suggestions) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updated = {
      ...currentSession,
      suggestions: { ...currentSession.suggestions, ...suggestions }
    };
    storage.saveSession(updated);
    set({ currentSession: updated });
  },

  toggleSelection: (category, item) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const items = currentSession.selectedItems[category];
    const updated = {
      ...currentSession,
      selectedItems: {
        ...currentSession.selectedItems,
        [category]: items.includes(item)
          ? items.filter(i => i !== item)
          : [...items, item]
      }
    };
    storage.saveSession(updated);
    set({ currentSession: updated });
  },

  updateDuration: (duration: number) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updated = { ...currentSession, recordingDuration: duration };
    storage.saveSession(updated);
    set({ currentSession: updated });
  },

  endSession: () => {
    const { currentSession } = get();
    if (currentSession) {
      storage.clearSession(currentSession.id);
    }
    set({ currentSession: null, isRecording: false });
  }
}));
