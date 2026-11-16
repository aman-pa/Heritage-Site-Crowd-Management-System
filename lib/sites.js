import connectToDatabase from '@/lib/mongodb';
import HeritageSite from '@/models/HeritageSite';
import { HERITAGE_SITES, getSiteBySlug } from '@/constants/heritageSites';

/**
 * Server-side helper to fetch a destination by slug with live database overrides.
 * Ensures administrator-managed images, descriptions, and gallery photos from MongoDB
 * take precedence over hardcoded static constants.
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

    // Merge: Database document takes precedence for imagery and content
    const primaryImage =
      siteDoc.image ||
      (siteDoc.images && siteDoc.images[0]) ||
      baseSite?.image ||
      '/images/monument-fallback.svg';

    const gallery =
      siteDoc.gallery && siteDoc.gallery.length > 0
        ? siteDoc.gallery
        : baseSite?.gallery || [];

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
      const primaryImage =
        doc.image ||
        (doc.images && doc.images[0]) ||
        baseSite.image ||
        '/images/monument-fallback.svg';

      const gallery =
        doc.gallery && doc.gallery.length > 0 ? doc.gallery : baseSite.gallery || [];

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
