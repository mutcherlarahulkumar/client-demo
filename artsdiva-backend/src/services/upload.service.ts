import { put } from "@vercel/blob";

// Generic file storage service — used by Artwork image uploads and
// reusable as-is for DocumentLog uploads later.

export interface UploadedFile {
  url: string;
  pathname: string;
}

export interface UploadableFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export async function uploadFile(file: UploadableFile): Promise<UploadedFile> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set");
  }

  const blob = await put(file.originalname, file.buffer, {
    access: "public",
    contentType: file.mimetype,
    token,
    addRandomSuffix: true,
  });

  return { url: blob.url, pathname: blob.pathname };
}

export async function uploadFiles(files: UploadableFile[]): Promise<string[]> {
  const uploaded = await Promise.all(files.map(uploadFile));
  return uploaded.map((file) => file.url);
}
