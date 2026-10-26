export type SiteImageSlot = 'hero' | 'care';

export interface SiteImage {
  id: string;
  slot: SiteImageSlot | string;
  title: string;
  alt: string;
  caption: string;
  src: string;
  width?: number;
  height?: number;
  order: number;
}

// Same base-URL convention as the other services: relative in development
// (CRA proxy) and in production (Firebase Hosting rewrite to the API function).
const BASE = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Images bundled with the site.
 *
 * Firebase Hosting serves the files from the CDN and Firestore holds the
 * metadata, but the page must still render if the API is unreachable - so the
 * defaults below keep the home page complete at all times.
 */
export const FALLBACK_SITE_IMAGES: SiteImage[] = [
  {
    id: 'hero-primary',
    slot: 'hero',
    title: 'People Today. Brighter Tomorrows.',
    alt: 'Collage of clinical trial participants and a doctor with the caption "People Today. Brighter Tomorrows. Clinical trials make a difference."',
    caption: 'Clinical trials make a difference - new treatments, real hope, brighter tomorrows.',
    src: '/images/hero-people-today-brighter-tomorrows.webp',
    width: 1536,
    height: 1024,
    order: 1
  },
  {
    id: 'care-at-home',
    slot: 'care',
    title: 'Care that reaches the bedside',
    alt: 'A family member talking with an elderly patient at home while a nurse adjusts an IV drip.',
    caption: 'Dignified care close to home, with family by your side.',
    src: '/images/care-at-home.webp',
    width: 349,
    height: 195,
    order: 2
  }
];

const text = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const normalizeImage = (raw: any): SiteImage | null => {
  const src = text(raw?.src);
  const slot = text(raw?.slot);
  if (!src || !slot) return null;

  return {
    id: text(raw?.id),
    slot,
    title: text(raw?.title),
    alt: text(raw?.alt) || text(raw?.title),
    caption: text(raw?.caption),
    src,
    width: Number(raw?.width) || undefined,
    height: Number(raw?.height) || undefined,
    order: Number(raw?.order) || 0
  };
};

export async function fetchSiteImages(): Promise<SiteImage[]> {
  const response = await fetch(`${BASE}/api/images`);

  if (!response.ok) {
    throw new Error(`Failed to load site images (${response.status})`);
  }

  const body = await response.json();
  const data: unknown[] = Array.isArray(body?.data) ? body.data : [];

  return data
    .map(item => normalizeImage(item))
    .filter((image): image is SiteImage => image !== null);
}

/**
 * Merge the Firestore-supplied list over the bundled defaults, so a slot that
 * is missing or hidden in the database keeps a working local image.
 */
export function mergeWithFallback(images: SiteImage[]): SiteImage[] {
  const merged = FALLBACK_SITE_IMAGES.map(fallback => {
    const match = images.find(image => image.slot === fallback.slot);
    return match ? { ...fallback, ...match } : fallback;
  });

  const extra = images.filter(
    image => !FALLBACK_SITE_IMAGES.some(fallback => fallback.slot === image.slot)
  );

  return [...merged, ...extra].sort((a, b) => a.order - b.order);
}

export function imageForSlot(images: SiteImage[], slot: SiteImageSlot): SiteImage {
  return (
    images.find(image => image.slot === slot) ||
    FALLBACK_SITE_IMAGES.find(image => image.slot === slot) ||
    FALLBACK_SITE_IMAGES[0]
  );
}
