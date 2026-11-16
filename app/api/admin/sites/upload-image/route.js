import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { saveUploadedImage, deleteStoredImage, validateImageBuffer } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/sites/upload-image
 * Authenticated Administrator endpoint to securely upload destination photographs.
 * Validates file magic bytes (JPEG/PNG/WebP), size (<= 5MB), and safe file storage.
 */
export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const prefix = formData.get('prefix') || 'destinations';

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, code: 'NO_FILE_PROVIDED', message: 'Please select a valid image file to upload.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic bytes and enforce file size / executable security
    try {
      validateImageBuffer(buffer);
    } catch (valErr) {
      const code = valErr.message.includes('exceeds') ? 'FILE_TOO_LARGE' : 'INVALID_IMAGE_FILE';
      return NextResponse.json(
        { success: false, code, message: valErr.message },
        { status: 400 }
      );
    }

    // Save image to storage abstraction (Object Storage or Local Persistent Fallback)
    const result = await saveUploadedImage({
      buffer,
      originalFilename: file.name,
      prefix: typeof prefix === 'string' ? prefix : 'destinations',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Destination image uploaded successfully.',
        data: {
          url: result.url,
          storageKey: result.storageKey,
          filename: result.filename,
          size: result.size,
          mimeType: result.mimeType,
          provider: result.provider,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Image upload failed.', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sites/upload-image
 * Authenticated Administrator endpoint to safely remove an uploaded image from storage.
 */
export async function DELETE(request) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    let target = searchParams.get('url') || searchParams.get('storageKey');

    if (!target) {
      try {
        const body = await request.json();
        target = body.url || body.storageKey;
      } catch {}
    }

    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Image URL or storage key is required.' },
        { status: 400 }
      );
    }

    await deleteStoredImage(target);

    return NextResponse.json({
      success: true,
      message: 'Image removed from storage.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete image.', error: error.message },
      { status: 500 }
    );
  }
}
