import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs'; // ensure Node runtime, not edge

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;

    if (!audio) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Convert File to something OpenAI SDK accepts
    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // In Next.js route handlers, the global File is available
    const fileForWhisper = new File([buffer], 'voice.webm', {
      type: audio.type || 'audio/webm',
    });

    const result = await openai.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe', // or "whisper-1" if you prefer
      file: fileForWhisper,
    });

    return NextResponse.json({ transcript: result.text });
  } catch (err) {
    console.error('voice-command error', err);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
