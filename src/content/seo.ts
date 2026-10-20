/* Page titles, descriptions, intro text, FAQs and structured data. Everything is built from the
   algorithm data, so nothing is invented and English and Hindi say the same thing. */
import { t } from '../app/i18n';
import { categoryOf, type Algorithm, type Lang, type Track } from './catalog';

/** The first title that fits in 60 characters. */
export function algoTitle(lang: Lang, a: Algorithm): string {
  const options = [
    `${a.name}: ${t(lang, 'seo.descriptor')} | PakkaDSA`,
    `${a.name} ${t(lang, 'seo.short')} | PakkaDSA`,
    `${a.name} ${t(lang, 'seo.tiny')}`,
  ];
  return options.find((o) => [...o].length <= 60) ?? options[options.length - 1];
}

export const algoDescription = (lang: Lang, a: Algorithm) =>
  t(lang, 'seo.algoDesc', { name: a.name });

const cx = (a: Algorithm) => ({
  avg: a.complexity.average,
  best: a.complexity.best,
  worst: a.complexity.worst,
  space: a.complexity.space,
});

/** Intro paragraph: description, interview tip, complexity, and how to use the visualizer. */
export const intro = (lang: Lang, a: Algorithm) =>
  [
    a.description[lang],
    a.interviewTip[lang],
    t(lang, 'intro.cx', cx(a)),
    t(lang, 'intro.tool'),
  ].join(' ');

export const faq = (lang: Lang, a: Algorithm) => [
  { q: t(lang, 'faq.time', { name: a.name }), a: t(lang, 'faq.timeA', { name: a.name, ...cx(a) }) },
  { q: t(lang, 'faq.when', { name: a.name }), a: a.description[lang] },
  { q: t(lang, 'faq.ask', { name: a.name }), a: a.interviewTip[lang] },
];

export const trackTitle = (lang: Lang, tr: Track) =>
  `${t(lang, 'track.title', { track: tr.name[lang] })} | PakkaDSA`;
export const trackDescription = (lang: Lang, tr: Track) =>
  t(lang, 'track.desc', {
    track: tr.name[lang],
    desc: tr.description[lang],
    count: tr.algorithms.length,
  });

/* ---------- JSON-LD ---------- */

export type JsonLd = Record<string, unknown>;

export const webApplication = (site: string, lang: Lang): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PakkaDSA',
  url: site,
  description: t(lang, 'seo.homeDesc'),
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  isAccessibleForFree: true,
  inLanguage: ['en', 'hi'],
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR' },
});

export const learningResource = (url: string, lang: Lang, a: Algorithm): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: a.name,
  url,
  description: a.description[lang],
  educationalLevel: 'Undergraduate',
  learningResourceType: 'Interactive visualization',
  teaches: `${a.name} (${categoryOf(a).name.en})`,
  inLanguage: lang,
  isAccessibleForFree: true,
});

export const faqPage = (lang: Lang, a: Algorithm): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq(lang, a).map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const itemList = (items: { name: string; url: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: it.url,
  })),
});

export const breadcrumbs = (items: { name: string; url: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
});

/** JSON for a <script type="application/ld+json"> block, safe against "</script>" in text. */
export const ldJson = (data: JsonLd) => JSON.stringify(data).replace(/</g, '\\u003c');
