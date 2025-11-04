# Prescription Assistant MVP - Development Plan

## Project Overview
A real-time prescription assistant for general medicine practitioners that uses voice transcription and AI to suggest symptoms, diagnoses, and medications during doctor-patient consultations.

---

## Tech Stack
- **Frontend**: Next.js (App Router) with TypeScript
- **UI Components**: shadcn/ui with dark mode
- **Voice Input**: OpenAI Realtime API
- **AI Suggestions**: OpenAI API (medical knowledge)
- **PDF Generation**: jsPDF or similar
- **Storage**: Browser localStorage
- **State Management**: React Context or Zustand
- **Styling**: Tailwind CSS (comes with shadcn)

---

## Data Models

### ConsultationSession
```typescript
{
  id: string; // unique session id (UUID)
  patientName: string;
  startedAt: string; // ISO timestamp
  recordingDuration: number; // in seconds (max 300)
  transcription: string; // full conversation text
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

Suggestion {
  id: string;
  text: string;
  confidence: number; // 0-1
  category: 'symptom' | 'diagnosis' | 'medicine';
}
```

### Prescription (Final)
```typescript
{
  id: string;
  consultationSessionId: string;
  patientName: string;
  date: string; // ISO date
  doctorNotes: string;
  symptoms: string[];
  diagnosis: string[];
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    specialInstructions: string;
  }[];
  additionalNotes: string;
  generatedAt: string;
}
```

---

## localStorage Schema

```
Key: "prescriptions" -> Array<Prescription>
Key: "consultationSession:{id}" -> ConsultationSession (temporary, cleared after PDF generated)
Key: "appSettings" -> { theme: 'dark' | 'light' }
```

---

## Phase 1: Core Workflow

### Step 1: Welcome / Patient Entry Screen
- Input field for patient name
- Button: "Start Consultation"
- Display previous prescriptions (list with patient names and dates)

### Step 2: Consultation Recording (Max 5 mins)
- Real-time transcription from OpenAI Realtime API
- Display live transcript with speaker identification (doctor/patient)
- Real-time suggestions updating continuously
- Timer showing recording duration (0:00 - 5:00)
- Stop button to end recording early

### Step 3: Review & Select Suggestions
- Display 3-5 suggestions in each category (symptoms, diagnoses, medicines)
- Show confidence scores
- Doctor can select/deselect suggestions
- Show selected items prominently

### Step 4: Draft Phase
- Editable form with fields:
  - Patient Name (pre-filled)
  - Date (pre-filled with today)
  - Selected Symptoms (editable list)
  - Selected Diagnosis (editable list)
  - Medicines (editable table with columns: Name, Dosage, Frequency, Duration, Special Instructions)
  - Doctor Notes (free text area)
- Button: "Finalize & Generate PDF"

### Step 5: PDF Generation & Session End
- Generate PDF with prescription template
- Store prescription in localStorage
- Clear current session
- Return to Welcome screen

---

## Component Structure

```
app/
├── layout.tsx (with theme provider, dark mode toggle)
├── page.tsx (main entry point)
├── providers.tsx (context providers)
└── components/
    ├── ConsultationRecorder.tsx
    ├── SuggestionsPanel.tsx
    ├── SuggestionItem.tsx
    ├── DraftPhase.tsx
    ├── PrescriptionForm.tsx
    ├── MedicineTable.tsx
    ├── PreviousPrescriptions.tsx
    ├── ThemeToggle.tsx
    └── PDFTemplate.tsx

lib/
├── hooks/
│   ├── useConsultation.ts
│   ├── useLocalStorage.ts
│   └── usePrescriptionHistory.ts
├── services/
│   ├── openai.ts (realtime + suggestions)
│   ├── pdf.ts (PDF generation)
│   └── storage.ts (localStorage operations)
├── types.ts
└── utils.ts
```

---

## API Integration Points

### 1. OpenAI Realtime API (Voice Transcription)
- Initialize connection when "Start Consultation" clicked
- Stream transcription in real-time
- Stop stream after 5 minutes or manual stop
- Full transcript stored in consultation session

### 2. OpenAI API (Medical Suggestions)
- Call after every transcription chunk (batch every 2-3 seconds to avoid rate limits)
- Prompt: "Based on this doctor-patient conversation, suggest up to 5: symptoms, diagnoses, medicines used in general practice"
- Parse response and rank by confidence
- Update suggestions in real-time UI

### 3. PDF Generation
- Use jsPDF + html2canvas OR a template-based approach
- Generate prescription document with:
  - Clinic/Doctor section (can be empty for MVP)
  - Patient name and consultation date
  - Chief complaints / symptoms
  - Diagnosis
  - Medicines with details
  - Doctor notes
  - Timestamp

---

## Implementation Steps

### Phase 1a: Foundation (Days 1-2)
- [ ] Setup Next.js project with shadcn/ui
- [ ] Configure dark mode with Tailwind
- [ ] Create type definitions
- [ ] Setup localStorage utilities
- [ ] Create Context API for session management

### Phase 1b: UI Components (Days 2-3)
- [ ] Welcome screen with patient name input
- [ ] Previous prescriptions list view
- [ ] Consultation recorder UI (with timer)
- [ ] Suggestions panel UI
- [ ] Draft phase form UI
- [ ] Medicine table component

### Phase 1c: OpenAI Integration (Days 3-4)
- [ ] Setup OpenAI Realtime API connection
- [ ] Implement voice transcription streaming
- [ ] Setup OpenAI API calls for suggestions
- [ ] Test transcription + suggestions flow

### Phase 1d: Business Logic (Days 4-5)
- [ ] Implement consultation session management
- [ ] Build suggestion ranking logic
- [ ] Create selection & confirmation flow
- [ ] Connect all components together

### Phase 1e: PDF & Storage (Days 5-6)
- [ ] Implement PDF generation
- [ ] Connect localStorage saving
- [ ] Build prescription history retrieval
- [ ] Test full workflow end-to-end

### Phase 1f: Polish & Testing (Days 6-7)
- [ ] Error handling
- [ ] Edge cases (network issues, max recording time)
- [ ] UI/UX refinements
- [ ] Cross-browser testing

---

## Key Features to Implement

### Real-time Transcription
- Use OpenAI Realtime API WebSocket connection
- Display speaker identification (Doctor/Patient)
- Buffer transcript and update every 2-3 seconds

### Smart Suggestions
- Batch API calls to avoid rate limiting
- Parse AI responses to extract symptoms/diagnoses/medicines
- Rank by confidence scores
- Filter duplicates

### Session Management
- Unique session ID for each consultation
- Store all data in memory during consultation
- Clear after PDF generation
- Persist final prescription to localStorage

### Selection & Confirmation
- Toggle suggestions on/off
- Show selected items in a clear list
- Allow editing before finalization

### PDF Generation
- Use jsPDF for reliable generation
- Template-based layout
- Include all necessary medical information
- Download automatically or save to localStorage

---

## localStorage Operations

### Save Prescription
```typescript
const saveToLocalStorage = (prescription: Prescription) => {
  const existing = JSON.parse(localStorage.getItem('prescriptions') || '[]');
  localStorage.setItem('prescriptions', JSON.stringify([...existing, prescription]));
};
```

### Retrieve Prescriptions
```typescript
const getPrescriptions = (): Prescription[] => {
  return JSON.parse(localStorage.getItem('prescriptions') || '[]');
};
```

### Clear Session
```typescript
const clearSession = (sessionId: string) => {
  localStorage.removeItem(`consultationSession:${sessionId}`);
};
```

---

## Error Handling & Edge Cases

1. **Recording Max Duration (5 mins)**
   - Auto-stop recording at 5 minutes
   - Show warning when approaching limit

2. **Transcription Errors**
   - Retry on API failure
   - Show error message to user
   - Allow manual transcript entry as fallback

3. **No Suggestions**
   - Handle cases where AI doesn't return suggestions
   - Show placeholder message
   - Allow manual entry

4. **Storage Quota**
   - Check localStorage quota before saving
   - Warn if approaching limit
   - Provide option to delete old prescriptions

5. **Session Timeout**
   - If user navigates away, save session state temporarily
   - Offer resume option on return

6. **Browser Compatibility**
   - Check for localStorage availability
   - Check for Web Audio API support
   - Check for OpenAI Realtime API support

---

## API Prompt Engineering

### For Suggestions Prompt
```
You are a medical assistant for general practitioners. Based on the following doctor-patient consultation transcript, extract and suggest:

1. Up to 5 symptoms/chief complaints mentioned
2. Up to 5 possible diagnoses (most relevant for general practice)
3. Up to 5 commonly used medicines for the suspected conditions

Format your response as JSON:
{
  "symptoms": [
    {"text": "symptom name", "confidence": 0.95},
    ...
  ],
  "diagnoses": [
    {"text": "diagnosis name", "confidence": 0.85},
    ...
  ],
  "medicines": [
    {"text": "medicine name", "confidence": 0.90},
    ...
  ]
}

Transcript:
[TRANSCRIPT HERE]

Only suggest treatments and medicines appropriate for a general practice setting. Be conservative and accurate.
```

---

## Prescription PDF Template

The PDF should include:

```
═════════════════════════════════════════
        MEDICAL PRESCRIPTION
═════════════════════════════════════════

Date: [DATE]
Patient Name: [PATIENT NAME]
Doctor: [DOCTOR NAME - optional for MVP]

─────────────────────────────────────────
CHIEF COMPLAINTS / SYMPTOMS
─────────────────────────────────────────
[Selected Symptoms - comma separated]

─────────────────────────────────────────
DIAGNOSIS / IMPRESSION
─────────────────────────────────────────
[Selected Diagnosis - comma separated]

─────────────────────────────────────────
MEDICINES / TREATMENT
─────────────────────────────────────────
Sl. | Medicine | Dosage | Frequency | Duration | Special Instructions
 1  | [Name]   | [Dos]  | [Freq]    | [Dur]    | [Instructions]
 2  | ...
 ...

─────────────────────────────────────────
ADDITIONAL NOTES
─────────────────────────────────────────
[Doctor Notes]

═════════════════════════════════════════
Generated: [TIMESTAMP]
═════════════════════════════════════════
```

---

## Testing Checklist

- [ ] Welcome screen loads correctly
- [ ] Patient name input works
- [ ] Recording starts and displays timer
- [ ] Transcription appears in real-time
- [ ] Suggestions update in real-time
- [ ] Suggestions can be selected/deselected
- [ ] Draft form populates with selections
- [ ] Medicine table allows adding/editing rows
- [ ] Doctor notes can be entered
- [ ] PDF generates correctly
- [ ] Prescription saved to localStorage
- [ ] Previous prescriptions display correctly
- [ ] Dark mode toggle works
- [ ] Recording stops at 5 minutes auto
- [ ] Manual stop works
- [ ] UI is responsive on mobile/tablet

---

## Potential Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| OpenAI Realtime API latency | Buffer transcription, update suggestions batched |
| Too many/too few suggestions | Implement filtering and confidence thresholds |
| localStorage quota exceeded | Implement compression or periodic cleanup |
| User leaves mid-consultation | Auto-save session state, offer resume |
| Poor transcription accuracy | Allow manual editing in draft phase |
| PDF formatting issues | Use templated approach instead of HTML |

---

## Next Steps After MVP

1. **Authentication**: Add doctor login/registration
2. **Backend**: Move to server-side for compliance and audit trails
3. **Database**: Store prescriptions persistently
4. **Patient History**: Link prescriptions to patient records
5. **Follow-ups**: Track prescription outcomes
6. **Multi-language**: Support regional languages
7. **Compliance**: Add region-specific prescription requirements
8. **Templates**: Allow custom prescription templates

---

## Environment Variables Needed

```
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_MODEL=gpt-4-turbo
```

(Note: For MVP, storing API key client-side is acceptable, but should use backend in production)

---

## Estimated Timeline
**Total: 7 days** for a working MVP with all core features

---

## Repository Structure
```
prescription-assistant/
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── app/
├── components/
├── lib/
├── public/
└── README.md
```

---

**Ready to start building? Let me know if you need clarification on any part!**