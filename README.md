# Prescription Assistant MVP

An AI-powered prescription assistant for general medicine practitioners that uses voice transcription and AI to suggest symptoms, diagnoses, and medications during doctor-patient consultations.

## Features

- 🎤 **Real-time Transcription** - Live transcription of doctor-patient conversations (simulated in MVP)
- 🤖 **AI-Powered Suggestions** - Automatic suggestions for symptoms, diagnoses, and medicines using OpenAI GPT-4
- ⏱️ **Timed Sessions** - 5-minute consultation recording limit with visual timer
- ✅ **Interactive Selection** - Easy selection/deselection of AI suggestions
- 📝 **Draft & Edit** - Review and edit prescriptions before finalizing
- 📄 **PDF Generation** - Generate professional prescription PDFs
- 💾 **Local Storage** - Save prescription history in browser localStorage
- 🌓 **Dark Mode** - Full dark mode support

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI**: shadcn/ui components with Tailwind CSS
- **State Management**: Zustand
- **AI**: OpenAI API (GPT-4)
- **PDF Generation**: jsPDF
- **Storage**: Browser localStorage

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root:
   ```bash
   NEXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
   ```
   
   ⚠️ **Important**: The MVP uses client-side API calls for simplicity. For production, implement a backend proxy to keep your API key secure.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Workflow

### 1. Welcome Screen
- Enter patient name
- View previous prescriptions
- Click "Start" to begin consultation

### 2. Consultation Recording (Max 5 minutes)
- Live transcription appears in real-time (simulated with demo text in MVP)
- AI analyzes conversation and provides suggestions for:
  - Symptoms
  - Diagnoses  
  - Medicines
- Select/deselect suggestions by clicking them
- Click "Stop Recording" when done
- Click "Proceed to Draft" to continue

### 3. Draft Phase
- Review and edit selected items
- Add/remove symptoms and diagnoses
- Configure medicines with:
  - Dosage
  - Frequency
  - Duration
  - Special instructions
- Add additional notes
- Click "Generate PDF & Finish" to:
  - Create a professional PDF prescription
  - Save to localStorage
  - Download PDF
  - Return to welcome screen

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking and linting
npm run checks

# Run linting only
npm run lint
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx             # Main page with phase management
│   └── globals.css          # Global styles and CSS variables
├── components/
│   ├── ui/                  # shadcn UI components
│   ├── consultation-recorder.tsx
│   ├── draft-phase.tsx
│   ├── suggestions-panel.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── welcome-screen.tsx
├── lib/
│   ├── services/
│   │   ├── openai.ts       # OpenAI API integration
│   │   ├── pdf.ts          # PDF generation
│   │   └── storage.ts      # localStorage operations
│   ├── store/
│   │   └── consultation-store.ts  # Zustand state management
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## Known Limitations (MVP)

1. **Simulated Transcription**: The MVP uses setTimeout to simulate real-time transcription. Production would integrate OpenAI Realtime API for actual voice-to-text.

2. **Client-Side API Key**: The OpenAI API key is exposed client-side. Production requires a backend proxy.

3. **Browser Storage**: Prescriptions are stored in localStorage. Production should use a proper database.

4. **No Authentication**: No user login system. Production needs doctor authentication and patient records.

5. **5MB Storage Limit**: localStorage has a ~5MB limit. Implement cleanup or backend storage for production.

## Future Enhancements

- [ ] Integrate OpenAI Realtime API for actual voice transcription
- [ ] Add backend API proxy for secure API key handling
- [ ] Implement user authentication for doctors
- [ ] Add patient record management
- [ ] Connect to proper database (PostgreSQL/MongoDB)
- [ ] Add prescription templates
- [ ] Support multiple languages
- [ ] Add audit trails and compliance features
- [ ] Implement follow-up tracking
- [ ] Add prescription export formats (CSV, JSON)

## Troubleshooting

**Issue**: TypeScript errors about missing modules
- **Solution**: Run `npm install` to ensure all dependencies are installed

**Issue**: Dark mode not working
- **Solution**: Clear browser cache and localStorage

**Issue**: PDF not generating
- **Solution**: Check browser console for errors. Ensure jsPDF is installed.

**Issue**: AI suggestions not appearing
- **Solution**: Verify your OpenAI API key is correct in `.env.local`

## Contributing

This is an MVP. Contributions welcome!

## License

MIT License
