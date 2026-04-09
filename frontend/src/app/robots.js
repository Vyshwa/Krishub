export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/apps', '/sso', '/pair', '/alerts', '/api/'],
      },
    ],
    sitemap: 'https://krishub.in/sitemap.xml',
  };
}
