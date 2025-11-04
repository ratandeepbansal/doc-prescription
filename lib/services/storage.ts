import { Prescription, ConsultationSession, AppSettings } from '../types';

const PRESCRIPTIONS_KEY = 'prescriptions';
const SESSION_PREFIX = 'consultationSession:';
const SETTINGS_KEY = 'appSettings';

export const storage = {
  // Prescriptions
  savePrescription(prescription: Prescription): void {
    const existing = this.getPrescriptions();
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify([...existing, prescription]));
  },

  getPrescriptions(): Prescription[] {
    try {
      const data = localStorage.getItem(PRESCRIPTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  deletePrescription(id: string): void {
    const existing = this.getPrescriptions();
    localStorage.setItem(
      PRESCRIPTIONS_KEY,
      JSON.stringify(existing.filter(p => p.id !== id))
    );
  },

  // Session
  saveSession(session: ConsultationSession): void {
    localStorage.setItem(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session));
  },

  getSession(sessionId: string): ConsultationSession | null {
    try {
      const data = localStorage.getItem(`${SESSION_PREFIX}${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearSession(sessionId: string): void {
    localStorage.removeItem(`${SESSION_PREFIX}${sessionId}`);
  },

  // Settings
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { theme: 'dark' };
    } catch {
      return { theme: 'dark' };
    }
  },

  // Check storage quota
  checkQuota(): { used: number; available: number } {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    return { used, available: 5242880 }; // ~5MB typical limit
  }
};
