import HeritageSite from '../models/HeritageSite.js';
import { HERITAGE_SITES } from '../constants/heritageSites.js';
import { SITE_PRICING_CATALOG } from '../constants/pricing.js';

const CORRUPTED_IMAGE_PATTERNS = [
  'photo-1598324789736-4861f89564a0', // Taj Mahal assigned to Red Fort
  'photo-1587474260584-136574528ed5', // India Gate assigned to Red Fort
  'photo-1584551246679-0daf3d275d0f', // Abu Dhabi mosque assigned to Red Fort
  'photo-1545231027-637d2f6210f8', // Starbucks logo assigned to Qutub Minar
  'photo-1569154941061-e231b4725ef1', // Runway assigned to Qutub Minar
  'photo-1628155930542-3c7a64e2c833', // Cartoon egg assigned to Qutub Minar
  'photo-1582510003544-4d00b7f74220', // Non-Hampi Dravidian temple
  'photo-1590050752117-238cb0fb12b1', // Kerala canoe assigned to Hampi
  'photo-1596176530529-78163a4f7af2', // City skyline assigned to Hampi
  'photo-1609137144813-7d9921338f24', // Thailand island assigned to Ajanta
  'photo-1600585154340-be6161a56a0c', // Modern house assigned to Ajanta
  'photo-1579783900882-c0d3dad7b119', // Dutch flowers assigned to Ajanta
  'photo-1629814249584-bd4d53cf0e7d', // Burger King assigned to Konark
  'photo-1606293926075-69a00dbfde81', // Coconut kalash assigned to Konark
  'photo-1591871937573-74dbba515c4c', // Kitten assigned to Konark
  '/images/hero-banner.jpg', // Non-existent fallback
];

export function isCorruptedOrMismatchedImage(url) {
  if (!url || typeof url !== 'string') return true;
  return CORRUPTED_IMAGE_PATTERNS.some((pat) => url.includes(pat));
}

/**
 * Ensures the database contains the standard heritage monument entries.
 * If HeritageSite collection is empty, populates from HERITAGE_SITES and official tariffs.
 * If monuments exist, safely migrates and backfills structured gallery and primary image fields.
 *
 * @returns {Promise<number>} Number of sites seeded or existing.
 */
export async function ensureHeritageSitesSeeded() {
  const count = await HeritageSite.countDocuments();

  if (count > 0) {
    // Backfill structured image and gallery fields for existing monuments if missing or corrupted
    for (const site of HERITAGE_SITES) {
      let doc = await HeritageSite.findOne({ slug: site.slug });

      // If a pilot site is missing from the database, insert it
      if (!doc) {
        const pricing = SITE_PRICING_CATALOG[site.slug] || {};
        const rates = pricing.rates || {};
        const primaryImg = site.image || '/images/monument-fallback.svg';
        const galleryItems = (site.gallery || []).map((item, idx) => ({
          url: typeof item === 'string' ? item : item.url,
          caption: item.caption || '',
          alt: item.alt || `${site.name} perspective`,
          order: idx,
          uploadedAt: new Date(),
        }));
        const allImages = [primaryImg, ...galleryItems.map((g) => g.url)].filter(Boolean);

        doc = new HeritageSite({
          name: site.name,
          slug: site.slug,
          tagline: site.tagline || '',
          description: site.shortDescription || site.description || '',
          historicalBackground: site.history || '',
          state: site.state,
          city: site.location || site.city || 'Agra',
          address: `${site.name}, ${site.location || site.city}, ${site.state}, India`,
          latitude: site.coordinates?.lat || site.latitude || 27.1751,
          longitude: site.coordinates?.lng || site.longitude || 78.0421,
          category: site.category || 'Mughal Architecture',
          openingHours: {
            open: site.visitingHours?.open || '06:00',
            close: site.visitingHours?.close || '18:00',
          },
          weeklyClosingDay: site.closedDays?.[0] || 'None',
          entryFee: {
            indianAdult: rates.indianAdult?.appliedRate ?? 50,
            saarcBimstec: rates.saarcBimstec?.appliedRate ?? 540,
            foreignerAdult: rates.foreignerAdult?.appliedRate ?? 1100,
            child: rates.child?.appliedRate ?? 0,
            mausoleumSupplement: pricing.addons?.mausoleumSupplement?.rate ?? 0,
          },
          visitorInstructions: site.keyFacts || [
            'Valid photo ID card matching registration name is mandatory at entry turnstiles.',
            'Prohibited items: large bags, tripods, tobacco, and lighters.',
            'Children below 15 years must be accompanied by an adult.',
          ],
          websiteUrl: pricing.officialSourceUrl || 'https://asi.nic.in',
          isFeatured: true,
          isActive: true,
          image: primaryImg,
          primaryImageMetadata: {
            url: primaryImg,
            alt: `${site.name} primary photograph`,
            caption: site.tagline || site.name,
            uploadedAt: new Date(),
          },
          gallery: galleryItems,
          images: allImages,
          demonstrationCapacity: {
            maxPerHour: site.hourlyCapacity || 1000,
            standardSlotCapacity: site.dailyCapacity ? Math.round(site.dailyCapacity / 8) : 200,
          },
        });
        await doc.save();
        continue;
      }

      let changed = false;

      // Fix primary image if missing or corrupted
      if (!doc.image || isCorruptedOrMismatchedImage(doc.image)) {
        doc.image = site.image || (doc.images && doc.images[0]) || '';
        if (doc.primaryImageMetadata) {
          doc.primaryImageMetadata.url = doc.image;
          doc.primaryImageMetadata.alt = `${site.name} authentic primary photograph`;
        }
        changed = true;
      }

      // Fix gallery if missing, empty, or containing corrupted items
      const hasCorruptedGallery =
        Array.isArray(doc.gallery) &&
        doc.gallery.some((g) => isCorruptedOrMismatchedImage(g?.url));

      if (!doc.gallery || doc.gallery.length === 0 || hasCorruptedGallery) {
        const galleryItems = (site.gallery || []).map((item, idx) => ({
          url: typeof item === 'string' ? item : item.url,
          caption: item.caption || '',
          alt: item.alt || `${site.name} architectural perspective`,
          order: idx,
          uploadedAt: new Date(),
        }));

        if (galleryItems.length > 0) {
          doc.gallery = galleryItems;
          changed = true;
        }
      }

      // Re-sync images backward-compatible array
      const galleryUrls = (doc.gallery || []).map((g) => g.url).filter(Boolean);
      const combined = [doc.image, ...galleryUrls].filter(Boolean);
      if (JSON.stringify(doc.images) !== JSON.stringify(combined)) {
        doc.images = combined;
        changed = true;
      }

      if (changed) {
        await doc.save();
      }
    }
    return count;
  }

  const siteDocs = HERITAGE_SITES.map((site) => {
    const pricing = SITE_PRICING_CATALOG[site.slug] || {};
    const rates = pricing.rates || {};
    const primaryImg = site.image || (site.images && site.images[0]) || '/images/monument-fallback.svg';
    const galleryItems = (site.gallery || []).map((item, idx) => ({
      url: typeof item === 'string' ? item : item.url,
      caption: item.caption || '',
      alt: item.alt || `${site.name} perspective`,
      order: idx,
      uploadedAt: new Date(),
    }));

    const allImages = [primaryImg, ...galleryItems.map((g) => g.url)].filter(Boolean);

    return {
      name: site.name,
      slug: site.slug,
      tagline: site.tagline || '',
      description: site.shortDescription || site.description || '',
      historicalBackground: site.history || '',
      state: site.state,
      city: site.location || site.city || 'Agra',
      address: `${site.name}, ${site.location || site.city}, ${site.state}, India`,
      latitude: site.coordinates?.lat || site.latitude || 27.1751,
      longitude: site.coordinates?.lng || site.longitude || 78.0421,
      category: site.category || 'Mughal Architecture',
      openingHours: {
        open: site.visitingHours?.open || '06:00',
        close: site.visitingHours?.close || '18:00',
      },
      weeklyClosingDay: site.closedDays?.[0] || 'None',
      entryFee: {
        indianAdult: rates.indianAdult?.appliedRate ?? 50,
        saarcBimstec: rates.saarcBimstec?.appliedRate ?? 540,
        foreignerAdult: rates.foreignerAdult?.appliedRate ?? 1100,
        child: rates.child?.appliedRate ?? 0,
        mausoleumSupplement: pricing.addons?.mausoleumSupplement?.rate ?? 0,
      },
      visitorInstructions: site.keyFacts || [
        'Valid photo ID card matching registration name is mandatory at entry turnstiles.',
        'Prohibited items: large bags, tripods, tobacco, and lighters.',
        'Children below 15 years must be accompanied by an adult.',
      ],
      websiteUrl: pricing.officialSourceUrl || 'https://asi.nic.in',
      isFeatured: true,
      isActive: true,
      image: primaryImg,
      primaryImageMetadata: {
        url: primaryImg,
        alt: `${site.name} primary photograph`,
        caption: site.tagline || site.name,
        uploadedAt: new Date(),
      },
      gallery: galleryItems,
      images: allImages,
      demonstrationCapacity: {
        maxPerHour: site.hourlyCapacity || 1000,
        standardSlotCapacity: site.dailyCapacity ? Math.round(site.dailyCapacity / 8) : 200,
      },
    };
  });

  await HeritageSite.insertMany(siteDocs);
  return siteDocs.length;
}
