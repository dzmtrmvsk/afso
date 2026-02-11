export function getCorsFromEnv() {
  const toList = (value: string) =>
    value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

  const originsRaw = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173';
  const methodsRaw = process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS';
  const allowedHeadersRaw =
    process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,Accept,Origin,X-Requested-With';

  return {
    origins: toList(originsRaw),
    methods: toList(methodsRaw),
    allowedHeaders: toList(allowedHeadersRaw),
  } as const;
}
