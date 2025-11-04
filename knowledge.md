# Prescription Assistant Knowledge

## Project Overview

This is a Next.js-based MVP for a prescription assistant that helps doctors during consultations. It uses AI to suggest symptoms, diagnoses, and medicines based on conversation transcripts.

## Architecture

- **State Management**: Zustand store manages consultation sessions
- **Phases**: Three main phases - welcome, recording, draft
- **Storage**: localStorage for prescriptions and session state
- **AI Integration**: OpenAI GPT-4 for medical suggestions

## Important Notes

1. **Simulated Transcription**: Currently uses setTimeout for demo. Real implementation would use OpenAI Realtime API.

2. **Client-Side API Calls**: API key is exposed client-side (NEXT_PUBLIC_ prefix). Production needs backend proxy.

3. **Phase Management**: Main page (app/page.tsx) controls phase transitions. When session ends, phase resets to 'welcome'.

4. **Error Handling**: Basic error handling in place. Production needs comprehensive error boundaries.

## Development Workflow

- Run `npm run checks` after changes (combines type checking + linting)
- Use shadcn-style components from components/ui/
- Follow TypeScript strict mode - all types defined in lib/types.ts

## Code Style

- Use "use client" directive for client components
- Prefer arrow functions for React components
- Keep components focused and small
- Use Tailwind for all styling
- Follow shadcn/ui patterns for UI components