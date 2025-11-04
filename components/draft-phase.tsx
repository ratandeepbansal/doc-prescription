"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, FileDown } from "lucide-react";
import { useConsultationStore } from "@/lib/store/consultation-store";
import { Medicine, Prescription } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { storage } from "@/lib/services/storage";
import { generatePrescriptionPDF } from "@/lib/services/pdf";

export function DraftPhase() {
  const { currentSession, endSession } = useConsultationStore();
  const [symptoms, setSymptoms] = useState<string[]>(
    currentSession?.selectedItems.symptoms || []
  );
  const [diagnoses, setDiagnoses] = useState<string[]>(
    currentSession?.selectedItems.diagnoses || []
  );
  const [medicines, setMedicines] = useState<Medicine[]>(
    currentSession?.selectedItems.medicines.map(name => ({
      name,
      dosage: '',
      frequency: '',
      duration: '',
      specialInstructions: ''
    })) || []
  );
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [newSymptom, setNewSymptom] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');

  if (!currentSession) return null;

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const addDiagnosis = () => {
    if (newDiagnosis.trim()) {
      setDiagnoses([...diagnoses, newDiagnosis.trim()]);
      setNewDiagnosis('');
    }
  };

  const removeDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        specialInstructions: ''
      }
    ]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleGeneratePDF = () => {
    const prescription: Prescription = {
      id: uuidv4(),
      consultationSessionId: currentSession.id,
      patientName: currentSession.patientName,
      date: new Date().toISOString(),
      doctorNotes: currentSession.transcription,
      symptoms,
      diagnosis: diagnoses,
      medicines: medicines.filter(m => m.name.trim()),
      additionalNotes,
      generatedAt: new Date().toISOString()
    };

    // Save to localStorage
    storage.savePrescription(prescription);

    // Generate PDF
    generatePrescriptionPDF(prescription);

    // End session and return to home
    endSession();
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Draft Prescription</h1>
          <p className="text-muted-foreground mt-1">
            Patient: {currentSession.patientName}
          </p>
        </div>
        <Button onClick={handleGeneratePDF} size="lg" className="gap-2">
          <FileDown className="h-5 w-5" />
          Generate PDF & Finish
        </Button>
      </div>

      <div className="grid gap-6 max-w-5xl">
        {/* Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md"
                >
                  <span>{symptom}</span>
                  <button
                    onClick={() => removeSymptom(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add symptom"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
              />
              <Button onClick={addSymptom} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Diagnoses */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnoses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {diagnoses.map((diagnosis, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md"
                >
                  <span>{diagnosis}</span>
                  <button
                    onClick={() => removeDiagnosis(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add diagnosis"
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDiagnosis()}
              />
              <Button onClick={addDiagnosis} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medicines */}
        <Card>
          <CardHeader>
            <CardTitle>Medicines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicines.map((medicine, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Medicine name"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Dosage (e.g., 500mg)"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      />
                      <Input
                        placeholder="Frequency (e.g., Twice daily)"
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Duration (e.g., 7 days)"
                      value={medicine.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                    />
                    <Input
                      placeholder="Special instructions (e.g., Take with food)"
                      value={medicine.specialInstructions}
                      onChange={(e) => updateMedicine(index, 'specialInstructions', e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => removeMedicine(index)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addMedicine} variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Medicine
            </Button>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes or instructions..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
