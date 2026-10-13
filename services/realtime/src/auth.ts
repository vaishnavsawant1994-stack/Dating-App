import { type RealtimeAuthContext, type RealtimePrincipal, type RealtimeTokenVerifier } from './types.js';

export const REALTIME_PROTOCOL = 'together.realtime.v1';
export const AUTH_PROTOCOL_PREFIX = 'together.auth.';
const MAX_TOKEN_BYTES = 4_096;

export class DenyAllTokenVerifier implements RealtimeTokenVerifier {
  isReady(): boolean {
    return false;
  }

  async verify(_token: string, _context: RealtimeAuthContext): Promise<RealtimePrincipal | null> {
    return null;
  }
}

export interface ParsedRealtimeProtocols {
  readonly token: string;
}

export function encodeAuthProtocol(token: string): string {
  if (Buffer.byteLength(token, 'utf8') === 0 || Buffer.byteLength(token, 'utf8') > MAX_TOKEN_BYTES) {
    throw new Error('Realtime token length is invalid.');
  }
  return `${AUTH_PROTOCOL_PREFIX}${Buffer.from(token, 'utf8').toString('base64url')}`;
}

export function parseRealtimeProtocols(header: string | undefined): ParsedRealtimeProtocols | null {
  if (header === undefined) {
    return null;
  }

  const protocols = header
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (!protocols.includes(REALTIME_PROTOCOL)) {
    return null;
  }

  const authProtocols = protocols.filter((value) => value.startsWith(AUTH_PROTOCOL_PREFIX));
  if (authProtocols.length !== 1) {
    return null;
  }

  const encoded = authProtocols[0]?.slice(AUTH_PROTOCOL_PREFIX.length) ?? '';
  if (encoded.length === 0 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
    return null;
  }

  const decoded = Buffer.from(encoded, 'base64url');
  if (decoded.length === 0 || decoded.length > MAX_TOKEN_BYTES || decoded.toString('base64url') !== encoded) {
    return null;
  }

  const token = decoded.toString('utf8');
  if (Buffer.byteLength(token, 'utf8') !== decoded.length) {
    return null;
  }

  return { token };
}

export function containsForbiddenCredentialQuery(url: string): boolean {
  const parsed = new URL(url, 'http://realtime.invalid');
  for (const key of ['access_token', 'token', 'auth', 'authorization']) {
    if (parsed.searchParams.has(key)) {
      return true;
    }
  }
  return false;
}
