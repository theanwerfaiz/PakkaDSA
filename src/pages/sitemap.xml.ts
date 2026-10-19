import type { APIRoute } from 'astro';
import { sitemapXml } from '../content/sitemap';

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml((site as URL).href), { headers: { 'Content-Type': 'application/xml' } });
