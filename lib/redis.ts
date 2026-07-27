export function getRedisUrl() {
  if (!process.env.REDIS_URL) throw new Error('REDIS_URL is not configured');
  return process.env.REDIS_URL;
}

export function redisStatus() {
  return { configured: Boolean(process.env.REDIS_URL) };
}
