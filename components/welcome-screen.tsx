"use client";

import { useState } from "react";
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
  const [prescriptions] = useState(() => storage.getPrescriptions());

  const handleStart = () => {
    if (patientName.trim()) {
      onStartConsultation(patientName.trim());
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
              <div className="space-y-2">
                {prescriptions.slice(-10).reverse().map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
