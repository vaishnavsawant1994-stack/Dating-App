export type MediaEnvironment = 'local' | 'test' | 'sandbox' | 'preview' | 'staging' | 'production';
export type MediaBucketClass = 'public' | 'private';
export type MediaEncryption = 'AES256' | 'aws:kms' | 'none';

export interface MediaConfig {
  readonly environment: MediaEnvironment;
  readonly serviceName: string;
  readonly host: string;
  readonly port: number;
  readonly logging: boolean;
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  readonly bodyLimitBytes: number;
  readonly publicBucket: string;
  readonly privateBucket: string;
  readonly endpoint?: string;
  readonly region: string;
  readonly forcePathStyle: boolean;
  readonly accessKeyId?: string;
  readonly secretAccessKey?: string;
  readonly encryption: MediaEncryption;
  readonly kmsKeyId?: string;
  readonly uploadTtlSeconds: number;
  readonly downloadTtlSeconds: number;
}

export interface MediaAccessContext {
  readonly requestId: string;
  readonly remoteAddress: string;
  readonly action: 'create_upload';
  readonly bucketClass: MediaBucketClass;
}

export interface MediaAccessAuthorizer {
  isReady(): boolean;
  authorize(context: MediaAccessContext): Promise<boolean>;
}

export interface CreateUploadUrlInput {
  readonly bucketClass: MediaBucketClass;
  readonly objectKey: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly checksumSha256?: string;
}

export interface CreateDownloadUrlInput {
  readonly bucketClass: MediaBucketClass;
  readonly objectKey: string;
}

export interface SignedMediaUrl {
  readonly url: string;
  readonly expiresAt: string;
  readonly headers: Readonly<Record<string, string>>;
}

export interface MediaStorageAdapter {
  readonly name: string;
  isReady(): Promise<boolean>;
  createUploadUrl(input: CreateUploadUrlInput): Promise<SignedMediaUrl>;
  createDownloadUrl(input: CreateDownloadUrlInput): Promise<SignedMediaUrl>;
}
