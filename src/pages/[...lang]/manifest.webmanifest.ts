import type { APIRoute } from 'astro';
import { t } from '../../app/i18n';
import { langPrefix, type Lang } from '../../content/catalog';
import { langPaths } from '../../content/routes';

export const getStaticPaths = langPaths;

export const GET: APIRoute = ({ props }) => {
  const lang = (props as { lang: Lang }).lang;
  const start = `${langPrefix(lang)}/`;
  return new Response(
    JSON.stringify({
      name: 'PakkaDSA',
      short_name: t(lang, 'app.short'),
      description: t(lang, 'seo.homeDesc'),
      lang,
      start_url: start,
      scope: '/',
      display: 'standalone',
      background_color: '#F7F8F4',
      theme_color: '#F7F8F4',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/icon-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
};
