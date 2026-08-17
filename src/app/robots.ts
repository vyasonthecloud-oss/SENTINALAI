import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sentinalai.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/api/*',
        '/checkout',
        '/orders',
        '/orders/*',
        '/reset-password',
        '/reset-password/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
