function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export const minio = {
  async presignedUrl(method: 'GET', bucket: string, file: string) {
    if (method !== 'GET') throw new Error('Only GET asset links are supported');
    if (!bucket || !file) throw new Error('bucket and file are required');

    const endpoint = requireEnv('MINIO_ENDPOINT').replace(/\/$/, '');
    const configuredBucket = process.env.GLOBAL_ASSET_BUCKET;
    const safeBucket = configuredBucket || bucket;
    const safeFile = file.replace(/^\/+/, '');

    return `${endpoint}/${encodeURIComponent(safeBucket)}/${safeFile.split('/').map(encodeURIComponent).join('/')}`;
  }
};
