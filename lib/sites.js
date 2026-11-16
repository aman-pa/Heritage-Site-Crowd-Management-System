import connectToDatabase from '@/lib/mongodb';
import HeritageSite from '@/models/HeritageSite';
import { HERITAGE_SITES, getSiteBySlug } from '@/constants/heritageSites';
import { isCorruptedOrMismatchedImage } from '@/lib/seedSites';

/**
 * Server-side helper to fetch a destination by slug with live database overrides.
 * Ensures administrator-managed images, descriptions, and gallery photos from MongoDB
 * take precedence over hardcoded static constants, while sanitizing against any corrupted legacy URLs.
 *
 * @param {string} slug - Monument slug
 * @returns {Promise<object|null>} Merged destination object or null
 */
export async function getLiveSiteBySlug(slug) {
  if (!slug) return null;
  const baseSite = getSiteBySlug(slug);

  try {
    await connectToDatabase();
    const cleanSlug = slug.toLowerCase().trim();
    const siteDoc = await HeritageSite.findOne({
      $or: [
        { slug: cleanSlug },
        { aliases: cleanSlug },
      ],
      isActive: true,
    }).lean();

    if (!siteDoc && !baseSite) {
      return null;
    }

    if (!siteDoc) {
      return baseSite;
    }

    // Merge: Database document takes precedence for imagery and content, with fallback if corrupted
    const rawPrimary = siteDoc.image || (siteDoc.images && siteDoc.images[0]);
    const primaryImage =
      rawPrimary && !isCorruptedOrMismatchedImage(rawPrimary)
        ? rawPrimary
        : baseSite?.image || '/images/monument-fallback.svg';

    let gallery = Array.isArray(siteDoc.gallery)
      ? siteDoc.gallery.filter((g) => {
          const url = typeof g === 'string' ? g : g?.url;
          return url && !isCorruptedOrMismatchedImage(url);
        })
      : [];

    if (gallery.length === 0 && baseSite?.gallery && baseSite.gallery.length > 0) {
      gallery = baseSite.gallery;
    }

    return {
      ...(baseSite || {}),
      ...siteDoc,
      id: siteDoc._id?.toString() || baseSite?.id,
      image: primaryImage,
      gallery,
    };
  } catch (err) {
    // Graceful fallback to static constants if DB connection fails
    return baseSite || null;
  }
}

/**
 * Server-side helper to fetch all active destinations with live database overrides.
 * @returns {Promise<Array<object>>}
 */
export async function getLiveSites() {
  try {
    await connectToDatabase();
    const siteDocs = await HeritageSite.find({ isActive: true }).lean();

    if (!siteDocs || siteDocs.length === 0) {
      return HERITAGE_SITES;
    }

    return siteDocs.map((doc) => {
      const baseSite = getSiteBySlug(doc.slug) || {};
      const rawPrimary = doc.image || (doc.images && doc.images[0]);
      const primaryImage =
        rawPrimary && !isCorruptedOrMismatchedImage(rawPrimary)
          ? rawPrimary
          : baseSite.image || '/images/monument-fallback.svg';

      let gallery = Array.isArray(doc.gallery)
        ? doc.gallery.filter((g) => {
            const url = typeof g === 'string' ? g : g?.url;
            return url && !isCorruptedOrMismatchedImage(url);
          })
        : [];

      if (gallery.length === 0 && baseSite.gallery && baseSite.gallery.length > 0) {
        gallery = baseSite.gallery;
      }

      return {
        ...baseSite,
        ...doc,
        id: doc._id?.toString() || baseSite.id,
        image: primaryImage,
        gallery,
      };
    });
  } catch (err) {
    return HERITAGE_SITES;
  }
}
