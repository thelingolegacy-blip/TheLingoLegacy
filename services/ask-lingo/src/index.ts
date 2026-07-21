import type { NextApiRequest, NextApiResponse } from 'next';
import { routeIntent } from './router';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, intent, context } = req.body ?? {};

  if (typeof intent !== 'string' || intent.length === 0) {
    res.status(400).json({ error: 'Missing intent' });
    return;
  }

  const result = await routeIntent({ userId, intent, context });
  res.status(200).json(result);
}
