import { randomUUID } from "crypto";
import path from "path";
import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

// Generic file storage service — used by Artwork image uploads and
// DocumentLog uploads. Backed by Azure Blob Storage; the account
// connection string never leaves the server (client code never sees it,
// files always transit through this authenticated backend).
//
// The storage account has anonymous public access disabled at the account
// level (Azure's secure default), so the container is private and every
// stored URL carries a long-lived read-only SAS token, signed here with the
// account key. The key itself is never exposed — only a scoped, read-only,
// time-limited token per blob.

export interface UploadedFile {
  url: string;
  pathname: string;
}

export interface UploadableFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

// Reachable well past any realistic gallery-record lifetime; re-signed on
// every future upload if this ever needs to be shortened.
const READ_SAS_EXPIRY_YEARS = 10;

interface AzureContext {
  containerClient: ContainerClient;
  credential: StorageSharedKeyCredential;
  containerName: string;
}

let contextPromise: Promise<AzureContext> | undefined;

function getContext(): Promise<AzureContext> {
  if (!contextPromise) {
    contextPromise = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? "images";
      if (!connectionString) {
        throw new Error("AZURE_STORAGE_CONNECTION_STRING environment variable is not set");
      }

      const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
      const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
      if (!accountNameMatch || !accountKeyMatch) {
        throw new Error("AZURE_STORAGE_CONNECTION_STRING is missing AccountName/AccountKey");
      }
      const credential = new StorageSharedKeyCredential(accountNameMatch[1] as string, accountKeyMatch[1] as string);

      const serviceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = serviceClient.getContainerClient(containerName);
      // Private container — the account itself disallows anonymous public
      // access, and this is the more secure default anyway. Reads happen
      // via per-blob SAS tokens generated below, never a bare URL.
      await containerClient.createIfNotExists();
      return { containerClient, credential, containerName };
    })();
  }
  return contextPromise;
}

// Random blob name, namespaced by upload date, keeping the original
// extension so content-type sniffing / browser downloads behave normally.
function buildBlobName(originalname: string): string {
  const ext = path.extname(originalname);
  const datePrefix = new Date().toISOString().slice(0, 10);
  return `${datePrefix}/${randomUUID()}${ext}`;
}

function signReadUrl(blobUrl: string, blobName: string, ctx: AzureContext): string {
  const expiresOn = new Date();
  expiresOn.setFullYear(expiresOn.getFullYear() + READ_SAS_EXPIRY_YEARS);

  const sas = generateBlobSASQueryParameters(
    {
      containerName: ctx.containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn,
    },
    ctx.credential
  ).toString();

  return `${blobUrl}?${sas}`;
}

export async function uploadFile(file: UploadableFile): Promise<UploadedFile> {
  const ctx = await getContext();
  const blobName = buildBlobName(file.originalname);
  const blockBlobClient = ctx.containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  return { url: signReadUrl(blockBlobClient.url, blobName, ctx), pathname: blobName };
}

export async function uploadFiles(files: UploadableFile[]): Promise<string[]> {
  const uploaded = await Promise.all(files.map(uploadFile));
  return uploaded.map((file) => file.url);
}
