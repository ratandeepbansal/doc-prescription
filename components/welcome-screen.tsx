"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PrescriptionDetailView } from "@/components/prescription-detail-view";
import { StorageQuotaIndicator } from "@/components/storage-quota-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Plus } from "lucide-react";
import { storage } from "@/lib/services/storage";
import { formatDate } from "@/lib/utils";

interface WelcomeScreenProps {
  onStartConsultation: (patientName: string) => void;
}

export function WelcomeScreen({ onStartConsultation }: WelcomeScreenProps) {
  const [patientName, setPatientName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [prescriptions, setPrescriptions] = useState(() => storage.getPrescriptions());
  const [selectedPrescription, setSelectedPrescription] = useState<typeof prescriptions[0] | null>(null);

  const handleDeletePrescription = (id: string) => {
    storage.deletePrescription(id);
    setPrescriptions(storage.getPrescriptions());
  };

  const handleStart = async () => {
    if (!patientName.trim()) return;

    // Request microphone permission early
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking permission
      onStartConsultation(patientName.trim());
    } catch (err) {
      console.error('Microphone permission error:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        toast.error('Microphone access is required for voice transcription. Please allow microphone access and try again.');
      } else {
        toast.error('Could not access microphone. Please check your browser settings.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Stethoscope className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Prescription Assistant</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            AI-powered consultation assistant for general practitioners
          </p>
        </div>

        {/* Start New Consultation */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Start New Consultation
            </CardTitle>
            <CardDescription>
              Enter patient name to begin recording
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="text-lg h-12"
              />
              <Button 
                onClick={handleStart} 
                disabled={!patientName.trim()}
                size="lg"
                className="px-8"
              >
                Start
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Storage Indicator */}
        <StorageQuotaIndicator />

        {/* Previous Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>
              {prescriptions.length === 0
                ? 'No prescriptions yet'
                : `${prescriptions.length} prescription(s) saved`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  Your prescription history will appear here after you create your first consultation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {(() => {
                    const filteredPrescriptions = prescriptions
                      .filter(p => p.patientName.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(-20)
                      .reverse();
                    
                    return filteredPrescriptions.length > 0 ? (
                      filteredPrescriptions.map((prescription) => (
                        <button
                          key={prescription.id}
                          onClick={() => setSelectedPrescription(prescription)}
                          className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                        >
                          <div>
                            <p className="font-medium">{prescription.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(prescription.date)}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {prescription.medicines.length} medicine(s)
                          </div>
                        </button>
                      ))
                    ) : searchQuery ? (
                      <p className="text-center text-muted-foreground py-4">No prescriptions found</p>
                    ) : null;
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedPrescription && (
        <PrescriptionDetailView
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          onDelete={handleDeletePrescription}
        />
      )}
    </div>
  );
}
