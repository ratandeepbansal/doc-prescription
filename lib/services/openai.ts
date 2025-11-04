import OpenAI from 'openai';
import { Suggestion } from '../types';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // For MVP only
});

export interface SuggestionsResponse {
  symptoms: Array<{ text: string; confidence: number }>;
  diagnoses: Array<{ text: string; confidence: number }>;
  medicines: Array<{ text: string; confidence: number }>;
}

export async function generateSuggestions(transcription: string): Promise<{
  symptoms: Suggestion[];
  diagnoses: Suggestion[];
  medicines: Suggestion[];
}> {
  if (!transcription.trim()) {
    return { symptoms: [], diagnoses: [], medicines: [] };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a medical assistant for general practitioners. Based on doctor-patient consultation transcripts, extract and suggest:

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

Only suggest treatments and medicines appropriate for a general practice setting. Be conservative and accurate.`
        },
        {
          role: 'user',
          content: `Transcript:
${transcription}

Provide suggestions in JSON format.`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const data: SuggestionsResponse = JSON.parse(content);

    return {
      symptoms: data.symptoms.map(s => ({
        id: uuidv4(),
        text: s.text,
        confidence: s.confidence,
        category: 'symptom' as const
      })),
      diagnoses: data.diagnoses.map(d => ({
        id: uuidv4(),
        text: d.text,
        confidence: d.confidence,
        category: 'diagnosis' as const
      })),
      medicines: data.medicines.map(m => ({
        id: uuidv4(),
        text: m.text,
        confidence: m.confidence,
        category: 'medicine' as const
      }))
    };
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return { symptoms: [], diagnoses: [], medicines: [] };
  }
}

// Note: For MVP, we're using a simulated transcription
// In production, you would use OpenAI Realtime API for actual voice transcription
export class TranscriptionService {
  private isActive = false;
  private onTranscriptUpdate: ((text: string) => void) | null = null;
  private accumulatedText = '';

  start(onUpdate: (text: string) => void) {
    this.isActive = true;
    this.onTranscriptUpdate = onUpdate;
    this.accumulatedText = '';
    
    // For MVP: Simulate transcription
    // In production: Connect to OpenAI Realtime API WebSocket
    console.log('Transcription started (simulated)');
  }

  stop() {
    this.isActive = false;
    this.onTranscriptUpdate = null;
    console.log('Transcription stopped');
  }

  // Simulate adding transcribed text
  addText(text: string) {
    if (!this.isActive) return;
    this.accumulatedText += text + ' ';
    this.onTranscriptUpdate?.(this.accumulatedText);
  }

  getAccumulatedText(): string {
    return this.accumulatedText;
  }
}
