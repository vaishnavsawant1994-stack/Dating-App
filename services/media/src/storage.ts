import { GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type CreateDownloadUrlInput, type CreateUploadUrlInput, type MediaBucketClass, type MediaConfig, type MediaStorageAdapter, type SignedMediaUrl } from './types.js';

export function buildS3ClientConfig(config: MediaConfig): S3ClientConfig {
  return {
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    ...(config.endpoint === undefined ? {} : { endpoint: config.endpoint }),
    ...(config.accessKeyId === undefined || config.secretAccessKey === undefined
      ? {}
      : { credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } }),
  };
}

export class S3MediaStorageAdapter implements MediaStorageAdapter {
  readonly name = 's3-compatible';
  private readonly client: S3Client;

  constructor(private readonly config: MediaConfig) {
    this.client = new S3Client(buildS3ClientConfig(config));
  }

  private bucket(bucketClass: MediaBucketClass): string {
    return bucketClass === 'public' ? this.config.publicBucket : this.config.privateBucket;
  }

  async isReady(): Promise<boolean> {
    try {
      await Promise.all([
        this.client.send(new HeadBucketCommand({ Bucket: this.config.publicBucket })),
        this.client.send(new HeadBucketCommand({ Bucket: this.config.privateBucket })),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  async createUploadUrl(input: CreateUploadUrlInput): Promise<SignedMediaUrl> {
    const expiresAt = new Date(Date.now() + this.config.uploadTtlSeconds * 1_000).toISOString();
    const encryption = this.config.encryption === 'none' ? undefined : this.config.encryption;
    const command = new PutObjectCommand({
      Bucket: this.bucket(input.bucketClass),
      Key: input.objectKey,
      ContentType: input.contentType,
      ...(input.checksumSha256 === undefined ? {} : { ChecksumSHA256: input.checksumSha256 }),
      ...(encryption === undefined ? {} : { ServerSideEncryption: encryption }),
      ...(encryption === 'aws:kms' && this.config.kmsKeyId !== undefined ? { SSEKMSKeyId: this.config.kmsKeyId } : {}),
    });
    const url = await getSignedUrl(this.client, command, { expiresIn: this.config.uploadTtlSeconds });
    const headers: Record<string, string> = { 'content-type': input.contentType };
    if (input.checksumSha256 !== undefined) {
      headers['x-amz-checksum-sha256'] = input.checksumSha256;
    }
    if (encryption !== undefined) {
      headers['x-amz-server-side-encryption'] = encryption;
    }
    if (encryption === 'aws:kms' && this.config.kmsKeyId !== undefined) {
      headers['x-amz-server-side-encryption-aws-kms-key-id'] = this.config.kmsKeyId;
    }
    return { url, expiresAt, headers };
  }

  async createDownloadUrl(input: CreateDownloadUrlInput): Promise<SignedMediaUrl> {
    const command = new GetObjectCommand({ Bucket: this.bucket(input.bucketClass), Key: input.objectKey });
    const url = await getSignedUrl(this.client, command, { expiresIn: this.config.downloadTtlSeconds });
    return {
      url,
      expiresAt: new Date(Date.now() + this.config.downloadTtlSeconds * 1_000).toISOString(),
      headers: {},
    };
  }
}
