import mongoose from 'mongoose';

/**
 * Gallery Image Sub-schema with structured metadata & ordering.
 */
const GalleryImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required.'],
      trim: true,
    },
    storageKey: {
      type: String,
      trim: true,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    alt: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    filename: {
      type: String,
      trim: true,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      trim: true,
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Audit log sub-schema tracking all image modifications on this monument.
 */
const ImageAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        'IMAGE_UPLOADED',
        'PRIMARY_IMAGE_UPDATED',
        'PRIMARY_IMAGE_REMOVED',
        'GALLERY_UPDATED',
        'IMAGE_REPLACED',
        'IMAGE_DELETED',
        'GALLERY_REORDERED',
      ],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    adminEmail: {
      type: String,
      default: '',
    },
    adminName: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const HeritageSiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide monument name.'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters.'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a unique slug.'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase letters, numbers, and hyphens).'],
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed site description.'],
      trim: true,
    },
    historicalBackground: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      required: [true, 'Please specify the Indian State/UT.'],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'Please specify city or district.'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90.'],
      max: [90, 'Latitude must be between -90 and 90.'],
      default: 0,
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180.'],
      max: [180, 'Longitude must be between -180 and 180.'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category.'],
      trim: true,
      index: true,
    },
    openingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '18:00' },
    },
    weeklyClosingDay: {
      type: String,
      default: 'None',
    },
    entryFee: {
      indianAdult: { type: Number, default: 50, min: 0 },
      saarcBimstec: { type: Number, default: 540, min: 0 },
      foreignerAdult: { type: Number, default: 1100, min: 0 },
      child: { type: Number, default: 0, min: 0 },
      mausoleumSupplement: { type: Number, default: 0, min: 0 },
    },
    visitorInstructions: {
      type: [String],
      default: [],
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Primary destination image URL (authoritative)
    image: {
      type: String,
      trim: true,
      default: '',
    },
    // Primary image metadata (storageKey, filename, caption, alt, source, size, mimeType)
    primaryImageMetadata: {
      url: { type: String, trim: true, default: '' },
      storageKey: { type: String, trim: true, default: '' },
      filename: { type: String, trim: true, default: '' },
      caption: { type: String, trim: true, default: '' },
      alt: { type: String, trim: true, default: '' },
      source: { type: String, trim: true, default: '' },
      size: { type: Number, default: 0 },
      mimeType: { type: String, trim: true, default: '' },
      uploadedAt: { type: Date, default: Date.now },
    },
    // Ordered architectural gallery collection
    gallery: {
      type: [GalleryImageSchema],
      default: [],
    },
    // Legacy backward-compatible images array: [primaryImage, ...galleryUrls]
    images: {
      type: [String],
      default: [],
    },
    // Complete audit log of all destination image updates
    imageAuditLog: {
      type: [ImageAuditLogSchema],
      default: [],
    },
    demonstrationCapacity: {
      maxPerHour: { type: Number, default: 1000, min: 1 },
      standardSlotCapacity: { type: Number, default: 200, min: 1 },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save synchronization hook to maintain backward compatibility
HeritageSiteSchema.pre('save', function (next) {
  // If primary image is not explicitly set, use images[0]
  if (!this.image && Array.isArray(this.images) && this.images.length > 0) {
    this.image = this.images[0];
  }

  // Ensure images array stays in sync with image + gallery
  const galleryUrls = Array.isArray(this.gallery)
    ? this.gallery.map((g) => g.url).filter(Boolean)
    : [];

  const combined = [this.image, ...galleryUrls].filter(Boolean);
  if (combined.length > 0) {
    this.images = combined;
  }

  next();
});

// Prevent re-compilation of existing model in Next.js hot-reload
export default mongoose.models.HeritageSite ||
  mongoose.model('HeritageSite', HeritageSiteSchema);
