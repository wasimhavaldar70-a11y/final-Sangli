import { MetadataRoute } from 'next';
import { api } from '@/services/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sangliceramica.com';

  // Base routes
  const routes = [
    '',
    '/products',
    '/gallery',
    '/projects',
    '/blogs',
    '/contact',
    '/appointments',
    '/about',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Dynamic products
    const products = await api.getProducts();
    const productRoutes = products.map((prod) => ({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: new Date(prod.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Dynamic blogs
    const blogs = await api.getBlogs();
    const blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: new Date(blog.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    return [...routes, ...productRoutes, ...blogRoutes];
  } catch (e) {
    console.error('Sitemap dynamic paths failed', e);
    return routes;
  }
}
