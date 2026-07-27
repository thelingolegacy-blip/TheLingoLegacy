import type { MetadataRoute } from 'next';

const routes = ['/', '/identity/login', '/wallet', '/xp', '/admin', '/avalon/archive'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://thelingolegacy.com${route}`,
    lastModified: new Date()
  }));
}
