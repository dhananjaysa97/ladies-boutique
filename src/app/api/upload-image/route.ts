import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

export const runtime = 'nodejs';

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

    const blob = await put(fileName, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (err) {
    console.error('Error uploading image to Blob:', err);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// 👇 NEW: delete an image from Blob by URL
export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'url is required' },
        { status: 400 }
      );
    }

    await del(url);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Error deleting image from Blob:', err);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
