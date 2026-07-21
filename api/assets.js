const ASSET_PREFIX = 'thats-my-lingo-casino/';
const PUBLIC_CACHE = 'public, s-maxage=60, stale-while-revalidate=300';

function classifyAsset(blob) {
  const pathname = blob.pathname || '';
  const contentType = blob.contentType || '';
  const ext = pathname.split('.').pop().toLowerCase();
  const folder = pathname.split('/')[1] || '00_UNCATEGORIZED';

  let kind = 'file';
  if (contentType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(ext)) kind = 'image';
  else if (contentType.startsWith('audio/') || ['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(ext)) kind = 'audio';
  else if (contentType.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(ext)) kind = 'video';
  else if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) kind = 'font';

  return {
    url: blob.url,
    pathname,
    category: folder,
    kind,
    contentType,
    uploadedAt: blob.uploadedAt || null,
    size: blob.size || 0
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { list } = await import('@vercel/blob');
    const response = await list({ prefix: ASSET_PREFIX, limit: 1000 });
    const assets = (response.blobs || [])
      .map(classifyAsset)
      .sort((a, b) => String(b.uploadedAt || '').localeCompare(String(a.uploadedAt || '')));

    res.setHeader('Cache-Control', PUBLIC_CACHE);
    return res.status(200).json({ prefix: ASSET_PREFIX, count: assets.length, assets });
  } catch (error) {
    console.error('Asset list failed:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ prefix: ASSET_PREFIX, count: 0, assets: [], error: 'Assets are not available yet.' });
  }
};
