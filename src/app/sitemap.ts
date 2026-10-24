import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legacybridge.vercel.app';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/dashboard',
    '/projects',
    '/analysis',
    '/architecture',
    '/business-logic',
    '/migration',
    '/drift',
    '/research',
    '/security',
    '/reports',
    '/validation',
    '/tasks',
    '/runs',
    '/about',
    '/pricing',
    '/faq',
    '/terms',
    '/privacy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/dashboard' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/dashboard' || route === '/drift' ? 0.9 : 0.7,
  }));
}
