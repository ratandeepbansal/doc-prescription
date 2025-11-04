# Prescription Assistant Knowledge

## Project Overview

This is a Next.js-based MVP for a prescription assistant that helps doctors during consultations. It uses AI to suggest symptoms, diagnoses, and medicines based on conversation transcripts.

## Architecture

- **State Management**: Zustand store manages consultation sessions
- **Phases**: Three main phases - welcome, recording, draft
- **Storage**: localStorage for prescriptions and session state
- **AI Integration**: OpenAI GPT-4 for medical suggestions

## Important Notes

1. **Real-time Voice Transcription**: Uses OpenAI Realtime API with WebSocket connection. Requires:
   - Microphone access
   - HTTPS (localhost works for dev)
   - API key with Realtime API beta access
   - Browser with Web Audio API support

2. **Client-Side WebSocket**: Direct connection to OpenAI for dev. Production needs relay server for security.

3. **Phase Management**: Main page (app/page.tsx) controls phase transitions. When session ends, phase resets to 'welcome'.

4. **Error Handling**: Basic error handling in place. Production needs comprehensive error boundaries.

## Development Workflow

- Run `npm run checks` after changes (combines type checking + linting)
- Run `npm run typecheck` for type checking only
- Use shadcn-style components from components/ui/
- Follow TypeScript strict mode - all types defined in lib/types.ts
- Use Sonner for toast notifications instead of browser alert()

## UI Components Available

- Button, Input, Textarea, Card, Badge
- Alert (for error/info messages)
- Skeleton (for loading states)
- Toaster (sonner - already configured in layout)

## Realtime API Implementation

- **Audio Format**: 24kHz mono PCM16
- **Event Handling**: Listen for `conversation.item.input_audio_transcription.completed` and `response.audio_transcript.delta`
- **Error Handling**: Gracefully handle microphone permission errors
- **Cleanup**: Always stop tracks, close context, and close WebSocket on unmount

## Code Style

- Use "use client" directive for client components
- Prefer arrow functions for React components
- Keep components focused and small
- Use Tailwind for all styling
- Follow shadcn/ui patterns for UI components
- Use toast notifications (Sonner) instead of browser alerts