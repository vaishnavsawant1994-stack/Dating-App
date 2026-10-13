const localApiBaseUrl = 'http://127.0.0.1:3000';

export function apiBaseUrl(source: Readonly<Record<string, string | undefined>> = process.env): string {
  const candidate = source.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (candidate === undefined || candidate.length === 0) {
    return localApiBaseUrl;
  }

  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must use http or https.');
  }
  return url.toString().replace(/\/$/, '');
}
