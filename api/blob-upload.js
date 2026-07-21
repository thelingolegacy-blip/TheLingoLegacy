const allowedContentTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/json',
  'application/octet-stream',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/mp4',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'font/ttf',
  'font/otf',
  'font/woff',
  'font/woff2'
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { handleUpload } = await import('@vercel/blob/client');
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload = {};
        try {
          payload = clientPayload ? JSON.parse(clientPayload) : {};
        } catch (_) {
          payload = {};
        }

        const uploadKey = process.env.TML_ASSET_UPLOAD_KEY;
        if (!uploadKey) {
          throw new Error('Asset uploads are not configured. Set TML_ASSET_UPLOAD_KEY in Vercel.');
        }

        if (payload.uploadKey !== uploadKey) {
          throw new Error('Invalid asset upload key.');
        }

        const category = String(payload.category || 'uncategorized').replace(/[^a-z0-9/_-]/gi, '').slice(0, 80);
        return {
          allowedContentTypes,
          maximumSizeInBytes: 100 * 1024 * 1024,
          tokenPayload: JSON.stringify({ category, pathname })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('That\'s My Lingo asset uploaded', {
          url: blob.url,
          pathname: blob.pathname,
          tokenPayload
        });
      }
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Blob upload token failed:', error);
    return res.status(400).json({ error: error.message || 'Unable to prepare upload.' });
  }
};
