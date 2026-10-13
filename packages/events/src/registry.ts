import { type z } from 'zod';

function registryKey(eventType: string, version: number): string {
  return `${eventType}:v${version}`;
}

export class EventSchemaRegistry {
  readonly #schemas = new Map<string, z.ZodType>();

  register(eventType: string, version: number, schema: z.ZodType): void {
    const key = registryKey(eventType, version);
    if (this.#schemas.has(key)) {
      throw new Error(`Event schema already registered: ${key}`);
    }
    this.#schemas.set(key, schema);
  }

  parse(eventType: string, version: number, input: unknown): unknown {
    const key = registryKey(eventType, version);
    const schema = this.#schemas.get(key);
    if (schema === undefined) {
      throw new Error(`Unsupported event schema: ${key}`);
    }
    return schema.parse(input);
  }

  has(eventType: string, version: number): boolean {
    return this.#schemas.has(registryKey(eventType, version));
  }
}
