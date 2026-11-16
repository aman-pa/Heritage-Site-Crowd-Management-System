import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configurable upload constraints
export const MAX_FILE_SIZE_BYTES =
  (parseInt(process.env.MAX_IMAGE_UPLOAD_SIZE_MB, 10) || 5) * 1024 * 1024; // Default: 5MB

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validates image buffer using magic number inspection rather than trusting file extensions.
 * 
 * Magic numbers:
 * - JPEG / JPG: FF D8 FF
 * - PNG: 89 50 4E 47 0D 0A 1A 0A
 * - WebP: 52 49 46 46 (RIFF) + 57 45 42 50 (WEBP at offset 8)
 *
 * @param {Buffer} buffer - File buffer
 * @returns {string} Detected mime type
 * @throws {Error} If buffer is invalid, empty, or malicious
 */
export function validateImageBuffer(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Image file is empty.');
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
    const maxMb = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    throw new Error(`File size (${sizeMb} MB) exceeds maximum allowed limit of ${maxMb} MB.`);
  }

  // Reject executable or script payloads
  const headStr = buffer.slice(0, 512).toString('latin1').toLowerCase();
  if (
    headStr.includes('<?php') ||
    headStr.includes('<script') ||
    headStr.includes('eval(') ||
    (buffer[0] === 0x4d && buffer[1] === 0x5a) // DOS/PE 'MZ' executable
  ) {
    throw new Error('Malicious or executable file payload detected. Upload rejected.');
  }

  // 1. JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // 2. PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // 3. WebP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  throw new Error('Invalid image format. Supported formats are JPEG (.jpg, .jpeg), PNG (.png), and WebP (.webp).');
}

/**
 * Sanitizes a filename, stripping paths and non-alphanumeric characters.
 * @param {string} originalFilename
 * @param {string} mimeType
 * @returns {string} Safe extension
 */
function getExtensionForMimeType(mimeType, originalFilename = '') {
  const extFromFilename = path.extname(originalFilename).toLowerCase().replace('.', '');
  if (mimeType === 'image/jpeg') {
    return extFromFilename === 'jpg' ? 'jpg' : 'jpeg';
  }
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

/**
 * Sanitizes base name for human readability in storage
 * @param {string} filename
 * @returns {string}
 */
function sanitizeBaseName(filename = '') {
  const base = path.basename(filename, path.extname(filename));
  return base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 32);
}

/**
 * Check if real production object storage (AWS S3, Cloudflare R2, MinIO) is configured.
 * @returns {boolean}
 */
export function isObjectStorageConfigured() {
  const accessKey =
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.R2_ACCESS_KEY_ID ||
    process.env.S3_ACCESS_KEY_ID ||
    '';
  const secretKey =
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.R2_SECRET_ACCESS_KEY ||
    process.env.S3_SECRET_ACCESS_KEY ||
    '';
  const bucketName =
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.R2_BUCKET_NAME ||
    process.env.S3_BUCKET_NAME ||
    '';

  const isPlaceholder =
    accessKey.includes('LOCAL_DEV') ||
    accessKey.includes('PLACEHOLDER') ||
    accessKey.includes('your_aws_') ||
    secretKey.includes('LOCAL_DEV') ||
    secretKey.includes('your_aws_');

  return Boolean(accessKey && secretKey && bucketName && !isPlaceholder);
}

/**
 * Instantiates and returns an AWS S3 client configured for standard AWS S3 or Cloudflare R2.
 * @returns {S3Client}
 */
function getS3Client() {
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.R2_ACCESS_KEY_ID ||
    process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.R2_SECRET_ACCESS_KEY ||
    process.env.S3_SECRET_ACCESS_KEY;
  const region =
    process.env.AWS_REGION ||
    process.env.R2_REGION ||
    'auto';

  let endpoint = process.env.AWS_S3_ENDPOINT || process.env.R2_ENDPOINT;
  if (!endpoint && process.env.R2_ACCOUNT_ID) {
    endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }

  const clientConfig = {
    region: endpoint ? 'auto' : (process.env.AWS_REGION || 'ap-south-1'),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };

  if (endpoint) {
    clientConfig.endpoint = endpoint;
    clientConfig.forcePathStyle = true;
  }

  return new S3Client(clientConfig);
}

/**
 * Returns current storage provider metadata for diagnostics and reports.
 * @returns {object}
 */
export function getStorageProviderInfo() {
  const isCloud = isObjectStorageConfigured();
  const bucket =
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.R2_BUCKET_NAME ||
    process.env.S3_BUCKET_NAME ||
    'public/uploads/destinations';
  const region = process.env.AWS_REGION || process.env.R2_REGION || 'local';
  const endpoint = process.env.AWS_S3_ENDPOINT || process.env.R2_ENDPOINT || null;

  return {
    provider: isCloud
      ? endpoint || process.env.R2_ACCOUNT_ID
        ? 'CLOUDFLARE_R2'
        : 'AWS_S3'
      : 'LOCAL_FILESYSTEM_STORAGE',
    bucket,
    region,
    endpoint,
    maxSizeMb: (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0),
    isCloud,
  };
}

/**
 * Saves an uploaded image buffer to persistent storage (Cloud Object Storage or Local Dev Fallback).
 *
 * @param {object} params
 * @param {Buffer} params.buffer - Image buffer
 * @param {string} params.originalFilename - Original client filename
 * @param {string} [params.prefix='destinations'] - Storage subfolder/prefix
 * @returns {Promise<object>} Upload result with public url, storageKey, size, and mimeType
 */
export async function saveUploadedImage({
  buffer,
  originalFilename = 'monument.jpg',
  prefix = 'destinations',
}) {
  const mimeType = validateImageBuffer(buffer);
  const ext = getExtensionForMimeType(mimeType, originalFilename);
  const cleanName = sanitizeBaseName(originalFilename) || 'image';
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  const safeFilename = `dest-${cleanName}-${timestamp}-${randomSuffix}.${ext}`;
  const storageKey = `${prefix}/${safeFilename}`;

  // 1. Cloud Object Storage (AWS S3 or Cloudflare R2)
  if (isObjectStorageConfigured()) {
    const s3 = getS3Client();
    const bucket =
      process.env.AWS_S3_BUCKET_NAME ||
      process.env.R2_BUCKET_NAME ||
      process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || process.env.R2_REGION || 'ap-south-1';
    const endpoint = process.env.AWS_S3_ENDPOINT || process.env.R2_ENDPOINT;
    const publicBaseUrl =
      process.env.AWS_S3_PUBLIC_URL ||
      process.env.R2_PUBLIC_URL ||
      process.env.CLOUDFLARE_R2_PUBLIC_URL;

    const uploadParams = {
      Bucket: bucket,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    };

    if (!endpoint && !process.env.R2_ACCOUNT_ID && process.env.ENABLE_S3_ACL === 'true') {
      uploadParams.ACL = 'public-read';
    }

    await s3.send(new PutObjectCommand(uploadParams));

    let publicUrl;
    if (publicBaseUrl) {
      publicUrl = `${publicBaseUrl.replace(/\/$/, '')}/${storageKey}`;
    } else if (endpoint) {
      publicUrl = `${endpoint.replace(/\/$/, '')}/${bucket}/${storageKey}`;
    } else {
      publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${storageKey}`;
    }

    return {
      success: true,
      url: publicUrl,
      storageKey,
      filename: originalFilename,
      size: buffer.length,
      mimeType,
      provider: endpoint || process.env.R2_ACCOUNT_ID ? 'CLOUDFLARE_R2' : 'AWS_S3',
    };
  }

  // 2. Production Environment Check: Do NOT silently write to local filesystem on Vercel
  const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
  const requireCloud = process.env.REQUIRE_CLOUD_STORAGE === 'true';

  if (isVercel || requireCloud) {
    throw new Error(
      'Production cloud object storage is not configured. On Vercel, persistent image storage requires AWS S3 or Cloudflare R2 credentials. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME (or R2 equivalents) in your environment variables.'
    );
  }

  // 3. Local Development Filesystem Storage (Non-production fallback only)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', prefix);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, safeFilename);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/uploads/${prefix}/${safeFilename}`;

  return {
    success: true,
    url: publicUrl,
    storageKey,
    filename: originalFilename,
    size: buffer.length,
    mimeType,
    provider: 'LOCAL_FILESYSTEM',
  };
}

/**
 * Deletes a stored image from cloud object storage or local disk.
 * @param {string} storageKeyOrUrl
 * @returns {Promise<boolean>}
 */
export async function deleteStoredImage(storageKeyOrUrl) {
  if (!storageKeyOrUrl) return false;

  // Cloud object storage deletion
  if (isObjectStorageConfigured()) {
    try {
      const s3 = getS3Client();
      const bucket =
        process.env.AWS_S3_BUCKET_NAME ||
        process.env.R2_BUCKET_NAME ||
        process.env.S3_BUCKET_NAME;

      let key = storageKeyOrUrl;
      if (key.includes('.amazonaws.com/')) {
        key = key.split('.amazonaws.com/')[1];
      } else if (key.includes('.r2.dev/')) {
        key = key.split('.r2.dev/')[1];
      } else if (key.startsWith('http://') || key.startsWith('https://')) {
        const parsed = new URL(key);
        key = parsed.pathname.replace(/^\//, '');
      }

      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
      return true;
    } catch (err) {
      console.warn('⚠️ S3 delete error:', err.message);
      return false;
    }
  }

  // Local filesystem fallback
  try {
    let cleanRelPath = '';
    if (storageKeyOrUrl.includes('/uploads/')) {
      cleanRelPath = storageKeyOrUrl.split('/uploads/')[1];
    } else if (storageKeyOrUrl.startsWith('destinations/') || storageKeyOrUrl.startsWith('uploads/')) {
      cleanRelPath = storageKeyOrUrl.replace(/^uploads\//, '');
    } else {
      cleanRelPath = path.join('destinations', path.basename(storageKeyOrUrl));
    }

    if (cleanRelPath && !cleanRelPath.includes('..')) {
      const fullPath = path.join(process.cwd(), 'public', 'uploads', cleanRelPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn('⚠️ Local file delete error:', err.message);
    return false;
  }
}
