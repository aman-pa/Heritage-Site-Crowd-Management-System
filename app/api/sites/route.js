import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HeritageSite from '@/models/HeritageSite';
import { ensureHeritageSitesSeeded } from '@/lib/seedSites';
import { HERITAGE_SITES, getSiteBySlug } from '@/constants/heritageSites';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sites
 * Public endpoint returning all active heritage destinations.
 * Dynamically resolves administrator-managed images and gallery photographs from MongoDB,
 * falling back gracefully to static heritage catalogue constants if database is initializing.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetSlug = searchParams.get('slug')?.toLowerCase()?.trim();

    await connectToDatabase();
    await ensureHeritageSitesSeeded();

    if (targetSlug) {
      const siteDoc = await HeritageSite.findOne({ slug: targetSlug, isActive: true });
      const baseSite = getSiteBySlug(targetSlug);

      if (!siteDoc && !baseSite) {
        return NextResponse.json(
          { success: false, message: 'Destination not found.' },
          { status: 404 }
        );
      }

      // Merge MongoDB record on top of base constants so admin-updated images take precedence
      const primaryImage =
        siteDoc?.image ||
        (siteDoc?.images && siteDoc.images[0]) ||
        baseSite?.image ||
        '/images/monument-fallback.svg';

      const gallery =
        siteDoc?.gallery && siteDoc.gallery.length > 0
          ? siteDoc.gallery
          : baseSite?.gallery || [];

      return NextResponse.json({
        success: true,
        data: {
          site: {
            ...(baseSite || {}),
            ...(siteDoc?.toObject ? siteDoc.toObject() : siteDoc || {}),
            id: siteDoc?._id?.toString() || baseSite?.id,
            image: primaryImage,
            gallery,
          },
        },
      });
    }

    // List all active sites
    const siteDocs = await HeritageSite.find({ isActive: true }).sort({ name: 1 });

    // Map and merge with static constants
    const sites = (siteDocs && siteDocs.length > 0 ? siteDocs : HERITAGE_SITES).map((item) => {
      const isMongoose = Boolean(item.toObject);
      const plainDoc = isMongoose ? item.toObject() : item;
      const baseSite = getSiteBySlug(plainDoc.slug) || {};

      const primaryImage =
        plainDoc.image ||
        (plainDoc.images && plainDoc.images[0]) ||
        baseSite.image ||
        '/images/monument-fallback.svg';

      const gallery =
        plainDoc.gallery && plainDoc.gallery.length > 0
          ? plainDoc.gallery
          : baseSite.gallery || [];

      return {
        ...baseSite,
        ...plainDoc,
        id: plainDoc._id?.toString() || plainDoc.id,
        image: primaryImage,
        gallery,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        sites,
        count: sites.length,
      },
    });
  } catch (error) {
    // Graceful fallback to static constants
    return NextResponse.json({
      success: true,
      data: {
        sites: HERITAGE_SITES,
        count: HERITAGE_SITES.length,
        isFallback: true,
      },
    });
  }
}
