# Quick Setup Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Your OpenAI API Key

Create a `.env.local` file:
```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

⚠️ **Important**: Your API key must have access to the Realtime API (currently in beta)

### 3. Run the App
```bash
npm run dev
```

Open http://localhost:3000 🎉

## What You'll See

1. **Welcome Screen** - Enter a patient name and click "Start" (microphone permission will be requested)
2. **Recording Phase** - Speak into your microphone and watch real-time AI transcription and suggestions
3. **Draft Phase** - Edit and finalize the prescription, then generate PDF

## Features

- ✅ Real-time voice transcription (uses OpenAI Realtime API)
- ✅ Real-time AI suggestions (uses GPT-4)
- ✅ Interactive selection of symptoms/diagnoses/medicines
- ✅ Editable prescription form
- ✅ PDF generation and download
- ✅ Dark/Light mode toggle
- ✅ Previous prescriptions history

## Important Notes

⚠️ **Requirements:**
- Microphone access required
- HTTPS required in production (localhost works for development)
- API key is client-side (use backend proxy in production)
- Data stored in localStorage (use database in production)

## Need Help?

Check the full [README.md](./README.md) for detailed documentation.
