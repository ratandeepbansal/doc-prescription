"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square } from "lucide-react";
import { useConsultationStore } from "@/lib/store/consultation-store";
import { formatDuration } from "@/lib/utils";
import { TranscriptionService, generateSuggestions } from "@/lib/services/openai";
import { SuggestionsPanel } from "@/components/suggestions-panel";

const MAX_DURATION = 300; // 5 minutes
const SUGGESTION_UPDATE_INTERVAL = 5000; // 5 seconds

interface ConsultationRecorderProps {
  onProceedToDraft: () => void;
}

export function ConsultationRecorder({ onProceedToDraft }: ConsultationRecorderProps) {
  const { currentSession, isRecording, stopRecording, updateTranscription, updateSuggestions, updateDuration } = useConsultationStore();
  const [duration, setDuration] = useState(0);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const transcriptionService = useRef<TranscriptionService>(new TranscriptionService());
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const suggestionTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!isRecording) return;

    const service = transcriptionService.current;

    // Start transcription service
    service.start((text) => {
      updateTranscription(text);
    });

    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setDuration(elapsed);
      updateDuration(elapsed);

      if (elapsed >= MAX_DURATION) {
        handleStop();
      }
    }, 1000);

    // Start periodic suggestion updates
    suggestionTimerRef.current = setInterval(async () => {
      if (currentSession?.transcription) {
        await updateSuggestionsFromTranscript(currentSession.transcription);
      }
    }, SUGGESTION_UPDATE_INTERVAL);

    // Simulate some transcription for demo
    setTimeout(() => {
      service.addText("Doctor: Hello, how are you feeling today?");
    }, 2000);
    setTimeout(() => {
      service.addText("Patient: I've been having a headache for the past two days.");
    }, 5000);
    setTimeout(() => {
      service.addText("Doctor: Can you describe the headache? Is it throbbing or constant?");
    }, 8000);
    setTimeout(() => {
      service.addText("Patient: It's a constant dull ache, mainly on the right side.");
    }, 11000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (suggestionTimerRef.current) clearInterval(suggestionTimerRef.current);
      service.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const updateSuggestionsFromTranscript = async (transcript: string) => {
    if (transcript.length < 50) return; // Wait for enough content
    
    setIsGeneratingSuggestions(true);
    try {
      const suggestions = await generateSuggestions(transcript);
      updateSuggestions(suggestions);
    } catch (error) {
      console.error('Error updating suggestions:', error);
      // Continue even if AI suggestions fail - user can manually add items later
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleStop = () => {
    stopRecording();
    transcriptionService.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (suggestionTimerRef.current) clearInterval(suggestionTimerRef.current);
  };

  if (!currentSession) return null;

  const isNearingLimit = duration >= MAX_DURATION - 30;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consultation Recording</h1>
          <p className="text-muted-foreground mt-1">
            Patient: {currentSession.patientName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-mono ${
            isNearingLimit ? 'text-destructive animate-pulse' : 'text-foreground'
          }`}>
            {formatDuration(duration)} / {formatDuration(MAX_DURATION)}
          </div>
          {isRecording && (
            <Button
              onClick={handleStop}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <Square className="h-5 w-5" />
              Stop Recording
            </Button>
          )}
        </div>
      </div>

      {!isRecording && (
        <div className="flex justify-center">
          <Button onClick={onProceedToDraft} size="lg" className="gap-2">
            Proceed to Draft
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcription */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className={isRecording ? 'h-5 w-5 text-destructive animate-pulse' : 'h-5 w-5'} />
              Live Transcription
            </CardTitle>
            <CardDescription>
              {isRecording ? 'Recording in progress...' : 'Recording stopped'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <span className="text-yellow-600 dark:text-yellow-500 text-xs font-medium">
                ℹ️ Demo Mode: Transcription is simulated for MVP demonstration
              </span>
            </div>
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 rounded-lg bg-muted">
              {currentSession.transcription ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {currentSession.transcription}
                </p>
              ) : (
                <p className="text-muted-foreground italic">Waiting for audio input...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="lg:col-span-1">
          <SuggestionsPanel isGenerating={isGeneratingSuggestions} />
        </div>
      </div>
    </div>
  );
}
