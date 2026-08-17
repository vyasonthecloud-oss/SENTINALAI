import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sentinalai.com';

  // 1. Static Storefront & Information Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/collections/all',
    '/collections/sensors',
    '/collections/microcontroller',
    '/collections/drone',
    '/collections/motor',
    '/collections/power',
    '/collections/tools',
    '/search',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/shipping',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' || route === '/collections/all') ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/collections') ? 0.8 : 0.5,
  }));

  // 2. Dynamic Active Product Routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Error generating product sitemap:', error);
  }

  return [...staticRoutes, ...productRoutes];
}
