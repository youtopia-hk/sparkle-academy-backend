import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import path from 'path';
import crypto from 'crypto';

// Initialize R2 Client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate unique filename with timestamp and random string
 */
const generateUniqueFilename = (originalFilename: string): string => {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `${basename}-${timestamp}-${randomString}${ext}`;
};

/**
 * Upload file to R2 bucket
 * @param buffer - File buffer from multer memoryStorage
 * @param originalFilename - Original filename
 * @param mimetype - File MIME type
 * @param folder - Folder path in bucket (e.g., 'images', 'documents')
 * @returns Public URL of uploaded file
 */
export const uploadToR2 = async (
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
  folder: string = 'images'
): Promise<{ url: string; key: string }> => {
  try {
    const uniqueFilename = generateUniqueFilename(originalFilename);
    const key = `${folder}/${uniqueFilename}`;

    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      },
    });

    await upload.done();

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    console.log(`File uploaded to R2: ${publicUrl}`);

    return { url: publicUrl, key };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to R2');
  }
};

/**
 * Upload multiple files to R2 in parallel
 * @param files - Array of files with buffer, filename, and mimetype
 * @param folder - Folder path in bucket
 * @returns Array of public URLs
 */
export const uploadMultipleToR2 = async (
  files: Array<{ buffer: Buffer; originalFilename: string; mimetype: string }>,
  folder: string = 'images'
): Promise<Array<{ url: string; key: string }>> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToR2(file.buffer, file.originalFilename, file.mimetype, folder)
    );

    const results = await Promise.all(uploadPromises);

    console.log(`${results.length} files uploaded to R2`);

    return results;
  } catch (error) {
    console.error('Error uploading multiple files to R2:', error);
    throw new Error('Failed to upload files to R2');
  }
};

/**
 * Delete file from R2 bucket
 * @param key - R2 object key (e.g., 'images/file-123456.jpg')
 */
export const deleteFromR2 = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    await r2Client.send(command);

    console.log(`File deleted from R2: ${key}`);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
};

/**
 * Get public URL for R2 object
 * @param key - R2 object key
 * @returns Public URL
 */
export const getPublicUrl = (key: string): string => {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};
