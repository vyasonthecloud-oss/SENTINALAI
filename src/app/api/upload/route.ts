import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

/**
 * Validates the file's binary magic bytes against standard image signatures
 * to prevent disguised executables or malicious scripts.
 */
function isValidImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return mimeType === 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return mimeType === 'image/png';
  }

  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return mimeType === 'image/gif';
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return mimeType === 'image/webp';
  }

  // AVIF: ....ftypavif or ....ftypavis
  const ftypStr = buffer.subarray(4, 12).toString('ascii');
  if (ftypStr === 'ftypavif' || ftypStr === 'ftypavis') {
    return mimeType === 'image/avif';
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Admin
    const admin = await getAuthenticatedAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Administrator access required.' }, { status: 401 });
    }

    // 2. Parse Multipart Form
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // 3. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed limit (5 MB).' }, { status: 400 });
    }

    // 4. Validate MIME Type & Extension
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: `Unsupported image MIME type: ${mimeType}` }, { status: 400 });
    }

    const originalName = file.name || 'image.jpg';
    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: `Unsupported file extension: ${ext}` }, { status: 400 });
    }

    // 5. Read Binary Buffer & Verify Magic Bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!isValidImageMagicBytes(buffer, mimeType)) {
      return NextResponse.json({ error: 'File failed binary image signature validation.' }, { status: 400 });
    }

    // 6. Ensure Uploads Directory Exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // 7. Write with Cryptographic Random Filename (Prevent Path Traversal & Collisions)
    const uniqueId = crypto.randomUUID();
    const safeFilename = `product_${uniqueId}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
