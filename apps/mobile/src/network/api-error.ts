export interface ApiErrorShape {
  readonly code: string;
  readonly message: string;
  readonly requestId?: string | undefined;
  readonly retryable: boolean;
  readonly status?: number | undefined;
}

export class MobileApiError extends Error {
  readonly code: string;
  readonly requestId?: string | undefined;
  readonly retryable: boolean;
  readonly status?: number | undefined;

  constructor(input: ApiErrorShape) {
    super(input.message);
    this.name = 'MobileApiError';
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}
