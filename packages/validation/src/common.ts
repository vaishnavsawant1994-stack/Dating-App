import { z } from 'zod';

export const IsoTimestampSchema = z.string().datetime({ offset: true });
export const NonEmptyTrimmedStringSchema = z.string().trim().min(1);
export const CountryCodeSchema = z.string().regex(/^[A-Z]{2}$/, 'Expected ISO 3166-1 alpha-2 code');
export const CurrencyCodeSchema = z.string().regex(/^[A-Z]{3}$/, 'Expected ISO 4217 currency code');
