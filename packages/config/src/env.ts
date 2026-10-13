import { type z } from 'zod';

export type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export function parseEnvironment<TSchema extends z.ZodType>(
  schema: TSchema,
  source: EnvironmentSource = process.env,
): z.output<TSchema> {
  return schema.parse(source);
}

const publicPrefixes = ['NEXT_PUBLIC_', 'EXPO_PUBLIC_'] as const;

export function pickPublicEnvironment(source: EnvironmentSource): Record<string, string> {
  return Object.fromEntries(
    Object.entries(source).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && publicPrefixes.some((prefix) => entry[0].startsWith(prefix)),
    ),
  );
}
