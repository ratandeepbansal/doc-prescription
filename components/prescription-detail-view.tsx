"use client";

import { useState } from "react";
import { Prescription } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, FileDown, FileJson, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { generatePrescriptionPDF } from "@/lib/services/pdf";
import { toast } from "sonner";

interface PrescriptionDetailViewProps {
  prescription: Prescription;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function PrescriptionDetailView({ prescription, onClose, onDelete }: PrescriptionDetailViewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const handleDownloadPDF = () => {
    try {
      generatePrescriptionPDF(prescription);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(prescription, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription_${prescription.patientName.replace(/\s+/g, '_')}_${prescription.id.slice(0, 8)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('JSON exported successfully');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast.error('Failed to export JSON');
    }
  };

  const handleDelete = () => {
    onDelete?.(prescription.id);
    toast.success('Prescription deleted');
    setShowDeleteDialog(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl">Prescription Details</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {prescription.patientName} - {formatDate(prescription.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" />
              PDF
            </Button>
            <Button onClick={handleExportJSON} variant="outline" size="sm" className="gap-2">
              <FileJson className="h-4 w-4" />
              JSON
            </Button>
            {onDelete && (
              <Button onClick={() => setShowDeleteDialog(true)} variant="outline" size="sm" className="gap-2 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Symptoms */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {prescription.symptoms.length > 0 ? (
                prescription.symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 rounded-md text-sm"
                  >
                    {symptom}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground italic">No symptoms recorded</p>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Diagnosis</h3>
            <div className="flex flex-wrap gap-2">
              {prescription.diagnosis.length > 0 ? (
                prescription.diagnosis.map((diag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-secondary/50 rounded-md text-sm"
                  >
                    {diag}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground italic">No diagnosis recorded</p>
              )}
            </div>
          </div>

          {/* Medicines */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Medicines</h3>
            {prescription.medicines.length > 0 ? (
              <div className="space-y-3">
                {prescription.medicines.map((medicine, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">{index + 1}. {medicine.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {medicine.dosage && (
                        <div>
                          <span className="text-muted-foreground">Dosage:</span> {medicine.dosage}
                        </div>
                      )}
                      {medicine.frequency && (
                        <div>
                          <span className="text-muted-foreground">Frequency:</span> {medicine.frequency}
                        </div>
                      )}
                      {medicine.duration && (
                        <div>
                          <span className="text-muted-foreground">Duration:</span> {medicine.duration}
                        </div>
                      )}
                      {medicine.specialInstructions && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Instructions:</span> {medicine.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No medicines prescribed</p>
            )}
          </div>

          {/* Additional Notes */}
          {prescription.additionalNotes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Additional Notes</h3>
              <p className="text-sm whitespace-pre-wrap p-4 bg-muted rounded-lg">
                {prescription.additionalNotes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>Prescription ID: {prescription.id}</p>
            <p>Generated: {new Date(prescription.generatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prescription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the prescription for {prescription.patientName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
