export async function POST(req: Request) {
  const { text } = await req.json();

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/jsCq9DZjX4fWj9S7y9XN`, // Default voice
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    return new Response('ElevenLabs API error', { status: 500 });
  }

  const audioBuffer = await response.arrayBuffer();
  return new Response(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
