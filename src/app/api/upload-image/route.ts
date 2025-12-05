import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Ensure Node runtime, not edge
export const runtime = 'nodejs';

// This route accepts a multipart/form-data POST with a "file" field
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public', // public URL
    });

    // blob.url is the public URL
    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (err) {
    console.error('Error uploading image to Blob:', err);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
