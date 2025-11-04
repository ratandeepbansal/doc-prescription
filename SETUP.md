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

### 3. Run the App
```bash
npm run dev
```

Open http://localhost:3000 🎉

## What You'll See

1. **Welcome Screen** - Enter a patient name and click "Start"
2. **Recording Phase** - Watch AI suggestions appear as simulated conversation happens
3. **Draft Phase** - Edit and finalize the prescription, then generate PDF

## Demo Features

- ✅ Real-time AI suggestions (uses GPT-4)
- ✅ Interactive selection of symptoms/diagnoses/medicines
- ✅ Editable prescription form
- ✅ PDF generation and download
- ✅ Dark/Light mode toggle
- ✅ Previous prescriptions history

## Important Notes

⚠️ **MVP Limitations:**
- Transcription is simulated (uses setTimeout for demo)
- API key is client-side (use backend proxy in production)
- Data stored in localStorage (use database in production)

## Need Help?

Check the full [README.md](./README.md) for detailed documentation.
