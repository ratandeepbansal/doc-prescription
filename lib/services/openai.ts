import OpenAI from 'openai';
import { Suggestion } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Check if API key is available
if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  console.warn('⚠️ OpenAI API key not found. AI suggestions will not work.');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // For MVP only - use backend proxy in production
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
    // Return empty suggestions to avoid breaking the UI
    return { symptoms: [], diagnoses: [], medicines: [] };
  }
}

// Real-time transcription using OpenAI Realtime API
export class TranscriptionService {
  private ws: WebSocket | null = null;
  private isActive = false;
  private onTranscriptUpdate: ((text: string) => void) | null = null;
  private accumulatedText = '';
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;

  async start(onUpdate: (text: string) => void) {
    this.isActive = true;
    this.onTranscriptUpdate = onUpdate;
    this.accumulatedText = '';

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Set up audio context
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      // Connect to OpenAI Realtime API
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      const model = 'gpt-4o-realtime-preview-2024-10-01';
      const url = `wss://api.openai.com/v1/realtime?model=${model}`;
      
      this.ws = new WebSocket(url, [
        'realtime',
        `openai-insecure-api-key.${apiKey}`,
        'openai-beta.realtime-v1'
      ]);

      this.ws.onopen = () => {
        console.log('✅ Connected to OpenAI Realtime API');
        
        // Configure session for transcription
        this.sendEvent({
          type: 'session.update',
          session: {
            modalities: ['text'],
            instructions: 'Transcribe the audio accurately. Identify speakers as Doctor or Patient when possible.',
            voice: 'alloy',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            }
          }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Debug: log all events
          console.log('Realtime API Event:', data.type);
          
          // Handle incremental transcription deltas
          if (data.type === 'response.audio_transcript.delta') {
            const delta = data.delta;
            if (delta) {
              this.accumulatedText += delta;
              this.onTranscriptUpdate?.(this.accumulatedText);
            }
          }
          
          // Handle completed transcription
          if (data.type === 'conversation.item.created') {
            const item = data.item;
            if (item?.formatted?.transcript) {
              this.accumulatedText += item.formatted.transcript + ' ';
              this.onTranscriptUpdate?.(this.accumulatedText);
            }
          }

          // Handle input audio transcription specifically
          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            const transcript = data.transcript;
            if (transcript) {
              this.accumulatedText += transcript + ' ';
              this.onTranscriptUpdate?.(this.accumulatedText);
            }
          }

          // Handle errors
          if (data.type === 'error') {
            console.error('Realtime API Error:', data.error);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      // Process and stream audio
      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.processor.onaudioprocess = (e) => {
        if (!this.isActive || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputBuffer = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputBuffer.length);
        
        for (let i = 0; i < inputBuffer.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputBuffer[i])) * 0x7FFF;
        }

        // Convert to base64 for transmission
        const uint8Array = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64Audio = btoa(binary);
        
        this.sendEvent({
          type: 'input_audio_buffer.append',
          audio: base64Audio
        });
      };

      console.log('🎤 Microphone activated - Real-time transcription started');
    } catch (error) {
      console.error('Error starting transcription:', error);
      throw error;
    }
  }

  stop() {
    this.isActive = false;
    
    // Stop audio processing
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.onTranscriptUpdate = null;
    console.log('🛑 Transcription stopped');
  }

  private sendEvent(event: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  getAccumulatedText(): string {
    return this.accumulatedText;
  }
}
