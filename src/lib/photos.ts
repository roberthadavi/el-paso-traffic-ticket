// Site photos: dimensions + ImageObject schema (geo-located to the office). Metadata text lives in src/data/photos.json
// and is also embedded in each JPEG's EXIF/XMP by scripts/photo-meta.py.
import { SITE } from '../data/site';
import META from '../data/photos.json';

const PORTRAIT = new Set(['staff-lobby-sign-portrait.jpg', 'staff-one-lobby-standing.jpg', 'staff-three-entrance-portrait.jpg', 'the-mission-building-directory-vista-del-sol.jpg']);

export function photoDims(src: string): { width: number; height: number } {
  const name = src.split('/').pop() || '';
  return PORTRAIT.has(name) ? { width: 1018, height: 1800 } : { width: 1800, height: 1018 };
}

export const PLACE = {
  '@type': 'Place',
  name: 'El Paso Traffic Ticket Firm — The Mission office',
  address: { '@type': 'PostalAddress', streetAddress: SITE.address.street, addressLocality: SITE.address.city, addressRegion: SITE.address.state, postalCode: SITE.address.zip, addressCountry: 'US' },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
};

/** schema.org ImageObject for a site photo; `alt` is the page-specific caption, falls back to the file's description. */
export function imageObject(src: string, alt?: string) {
  const name = src.split('/').pop() || '';
  const m = (META as Record<string, { title: string; description: string }>)[name];
  const { width, height } = photoDims(src);
  return {
    '@type': 'ImageObject',
    '@id': `${SITE.url}${src}#image`,
    contentUrl: `${SITE.url}${src}`,
    url: `${SITE.url}${src}`,
    name: m?.title || alt,
    caption: alt || m?.description,
    description: m?.description || alt,
    width, height,
    encodingFormat: 'image/jpeg',
    contentLocation: PLACE,
    creditText: 'El Paso Traffic Ticket Firm',
    creator: { '@type': 'Organization', name: SITE.legalName },
    copyrightNotice: '© El Paso Traffic Ticket Firm',
    copyrightHolder: { '@id': `${SITE.url}/#organization` },
    license: `${SITE.url}/terms-of-use/`,
    acquireLicensePage: `${SITE.url}/contact-us/`,
    representativeOfPage: false,
  };
}
