import { useEffect, useState } from 'react';
import {
  FALLBACK_SITE_IMAGES,
  SiteImage,
  fetchSiteImages,
  mergeWithFallback
} from '../services/imagesApi';

/**
 * Loads the site photos described in Firestore (via GET /api/images).
 *
 * The bundled defaults are used immediately, so the page never waits on the
 * network to show its imagery; the Firestore records simply replace them once
 * they arrive.
 */
export function useSiteImages() {
  const [images, setImages] = useState<SiteImage[]>(FALLBACK_SITE_IMAGES);
  const [source, setSource] = useState<'fallback' | 'firestore'>('fallback');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const remote = await fetchSiteImages();
        if (cancelled || remote.length === 0) return;
        setImages(mergeWithFallback(remote));
        setSource('firestore');
      } catch {
        // Keep the bundled defaults; the page stays complete.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { images, source, loading };
}

export default useSiteImages;
