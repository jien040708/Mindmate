import { Persona } from '../types/persona';
import { Message } from '../types/thread';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Backend is always initialized when Supabase is connected
export function initializeGemini(apiKey?: string) {
  // No-op: Backend handles API key
  return;
}

export function isGeminiInitialized(): boolean {
  // Always return true since we're using the backend
  return true;
}

export async function sendMessageToGemini(
  userMessage: string,
  persona: Persona,
  conversationHistory: Message[],
  mood?: number,
  language?: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c31a62f1/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          message: userMessage,
          // avatarDataUrl은 base64 이미지라 수 MB → 제거 후 전송
          persona: { ...persona, avatarDataUrl: undefined },
          conversationHistory,
          mood,
          language,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get response from server');
    }

    const data = await response.json();

    if (!data.success || !data.response) {
      throw new Error('Invalid response from server');
    }

    return data.response;
  } catch (error) {
    console.error('Error calling backend:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get response from AI. Please try again.');
  }
}
