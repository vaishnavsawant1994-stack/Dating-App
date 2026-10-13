import { createHash } from 'node:crypto';
import { type AiRequest } from './contracts.js';
import { type AiProvider } from './provider.js';
import { type AiProviderResult } from './types.js';

function hashBytes(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

function vector(value: string): readonly number[] {
  const digest = hashBytes(value);
  return Array.from({ length: 8 }, (_, index) => Number((((digest[index] ?? 0) / 255) * 2 - 1).toFixed(6)));
}

function deterministicIndex(value: string, length: number): number {
  const digest = hashBytes(value);
  return (digest[0] ?? 0) % length;
}

export class FakeAiProvider implements AiProvider {
  readonly name = 'fake';
  readonly synthetic = true;

  isReady(): boolean {
    return true;
  }

  async execute(request: AiRequest): Promise<AiProviderResult> {
    switch (request.operation) {
      case 'generate':
        return { result: { text: `[fake] ${request.payload.prompt.slice(0, 256)}` } };
      case 'embed': {
        const values = Array.isArray(request.payload.input) ? request.payload.input : [request.payload.input];
        return { result: { embeddings: values.map((value) => vector(value)) } };
      }
      case 'classify': {
        const index = deterministicIndex(request.payload.input, request.payload.labels.length);
        return {
          result: {
            label: request.payload.labels[index] ?? request.payload.labels[0],
            confidence: 0.5,
          },
        };
      }
      case 'moderate':
        return { result: { allowed: true, categories: [], synthetic_notice: 'Fake provider does not perform real safety moderation.' } };
      case 'translate':
        return { result: { text: `[fake:${request.payload.target_language}] ${request.payload.input}` } };
      case 'extract_structured':
        return {
          result: {
            fields: Object.fromEntries(request.payload.fields.map((field) => [field, null])),
          },
        };
    }
  }
}
