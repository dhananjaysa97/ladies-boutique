import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

export const runtime = 'nodejs'; // ❗ important: Blob needs Node runtime

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // You can customize the path prefix if you want folders
    const blob = await put(`products/${file.name}`, file, {
      access: 'public',
      allowOverwrite: true,
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (err) {
    console.error('Error uploading image:', err);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    await del(url);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error deleting image:', err);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
