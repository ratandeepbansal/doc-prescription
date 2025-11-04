"use client";
import { useState } from "react";
import { WelcomeScreen } from "@/components/welcome-screen";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConsultationRecorder } from "@/components/consultation-recorder";
import { DraftPhase } from "@/components/draft-phase";
import { useConsultationStore } from "@/lib/store/consultation-store";

type Phase = 'welcome' | 'recording' | 'draft';

export default function Home() {
  const { currentSession, startSession } = useConsultationStore();
  const [phase, setPhase] = useState<Phase>('welcome');

  const handleStartConsultation = (patientName: string) => {
    startSession(patientName);
    setPhase('recording');
  };

  const handleProceedToDraft = () => {
    setPhase('draft');
  };

  // Reset phase when session ends
  if (!currentSession && phase !== 'welcome') {
    setPhase('welcome');
  }

  return (
    <>
      <ThemeToggle />
      {phase === 'welcome' && (
        <WelcomeScreen onStartConsultation={handleStartConsultation} />
      )}
      {phase === 'recording' && currentSession && (
        <ConsultationRecorder onProceedToDraft={handleProceedToDraft} />
      )}
      {phase === 'draft' && currentSession && (
        <DraftPhase />
      )}
    </>
  );
}
