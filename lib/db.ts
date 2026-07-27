export function getPostgresUrl() {
  if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL is not configured');
  return process.env.POSTGRES_URL;
}

export function databaseStatus() {
  return { configured: Boolean(process.env.POSTGRES_URL) };
}
