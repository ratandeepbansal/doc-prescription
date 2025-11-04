import jsPDF from 'jspdf';
import { Prescription } from '../types';

export function generatePrescriptionPDF(prescription: Prescription): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICAL PRESCRIPTION', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Separator
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Patient and Date Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(prescription.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, margin, yPos);
  yPos += 8;
  doc.text(`Patient Name: ${prescription.patientName}`, margin, yPos);
  yPos += 15;

  // Chief Complaints / Symptoms
  doc.setFont('helvetica', 'bold');
  doc.text('CHIEF COMPLAINTS / SYMPTOMS', margin, yPos);
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  if (prescription.symptoms.length > 0) {
    const symptomsText = prescription.symptoms.join(', ');
    const splitSymptoms = doc.splitTextToSize(symptomsText, pageWidth - 2 * margin);
    doc.text(splitSymptoms, margin, yPos);
    yPos += splitSymptoms.length * 6 + 8;
  } else {
    doc.text('None recorded', margin, yPos);
    yPos += 14;
  }

  // Diagnosis
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSIS / IMPRESSION', margin, yPos);
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  if (prescription.diagnosis.length > 0) {
    const diagnosisText = prescription.diagnosis.join(', ');
    const splitDiagnosis = doc.splitTextToSize(diagnosisText, pageWidth - 2 * margin);
    doc.text(splitDiagnosis, margin, yPos);
    yPos += splitDiagnosis.length * 6 + 8;
  } else {
    doc.text('None recorded', margin, yPos);
    yPos += 14;
  }

  // Medicines
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICINES / TREATMENT', margin, yPos);
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (prescription.medicines.length > 0) {
    prescription.medicines.forEach((medicine, index) => {
      if (yPos > 250) { // Check if we need a new page
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${medicine.name}`, margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      if (medicine.dosage) {
        doc.text(`   Dosage: ${medicine.dosage}`, margin, yPos);
        yPos += 5;
      }
      if (medicine.frequency) {
        doc.text(`   Frequency: ${medicine.frequency}`, margin, yPos);
        yPos += 5;
      }
      if (medicine.duration) {
        doc.text(`   Duration: ${medicine.duration}`, margin, yPos);
        yPos += 5;
      }
      if (medicine.specialInstructions) {
        doc.text(`   Instructions: ${medicine.specialInstructions}`, margin, yPos);
        yPos += 5;
      }
      yPos += 4;
    });
  } else {
    doc.text('None prescribed', margin, yPos);
    yPos += 10;
  }

  // Additional Notes
  if (prescription.additionalNotes) {
    yPos += 5;
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ADDITIONAL NOTES', margin, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(prescription.additionalNotes, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, yPos);
    yPos += splitNotes.length * 5 + 10;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Generated: ${new Date(prescription.generatedAt).toLocaleString()}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Download the PDF
  const fileName = `prescription_${prescription.patientName.replace(/\s+/g, '_')}_${new Date(prescription.date).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
