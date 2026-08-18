import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Text scrubber utility to clean Markdown, URLs, and weird symbols from LLM response before TTS
function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/[*_`#~=+\-\[\]{}()]/g, '') // Strip markdown formatting and symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert markdown links [text](url) to just "text"
    .replace(/https?:\/\/\S+/g, '') // Strip URLs
    .replace(/[🤖⚙️🛰️🔋📈🌩️🧬💻🖥️📊🛠️🩺🔐⚠️📡🔌🕹️🌐🔬🔔🔒🧠📡🌍🔊💬👁️🗨️🔄🔍🧭🎛️⏱️]/gu, '') // Strip common HUD emojis that JARVIS might print
    .replace(/\s+/g, ' ') // Collapse extra spaces
    .trim();
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const cleanedText = cleanTextForSpeech(text);

    if (!cleanedText) {
      return new Response(JSON.stringify({ error: "Empty speech payload after scrubbing" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'jsCq9DZjX4fWj9S7y9XN'; // Default high-quality professional voice

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ElevenLabs API key is missing" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, // Use streaming endpoint!
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: cleanedText,
          model_id: 'eleven_turbo_v2_5', // Use extremely low-latency turbo model!
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.0,
            use_speaker_boost: true
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return new Response(JSON.stringify({ error: 'ElevenLabs synthesis failed', details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the ElevenLabs streaming response body directly for low-latency chunked play
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked'
      },
    });
  } catch (error: any) {
    console.error('TTS Route Exception:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
