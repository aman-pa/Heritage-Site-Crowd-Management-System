'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Landmark,
  Save,
  AlertCircle,
  Clock,
  IndianRupee,
  Layers,
  MapPin,
  Camera,
  Upload,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import SiteImage from '@/components/site/SiteImage';

export default function EditHeritageSitePage({ params }) {
  const router = useRouter();
  const siteId = params.id;
  const primaryFileInputRef = useRef(null);
  const replacePrimaryInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const replaceGalleryInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Primary Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    historicalBackground: '',
    state: '',
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
    category: '',
    openTime: '06:00',
    closeTime: '18:00',
    weeklyClosingDay: 'None',
    feeIndianAdult: 50,
    feeSaarcBimstec: 540,
    feeForeignerAdult: 1100,
    feeChild: 0,
    feeMausoleumSupplement: 0,
    visitorInstructions: '',
    websiteUrl: '',
    isFeatured: false,
    isActive: true,
    maxPerHour: 1000,
    standardSlotCapacity: 200,
  });

  // Dedicated Destination Images State
  const [primaryImage, setPrimaryImage] = useState('');
  const [primaryImageMetadata, setPrimaryImageMetadata] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [hasUnsavedImageChanges, setHasUnsavedImageChanges] = useState(false);

  // Uploading / Confirmation UX State
  const [isUploadingPrimary, setIsUploadingPrimary] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imageActionSuccess, setImageActionSuccess] = useState('');
  const [confirmRemovePrimary, setConfirmRemovePrimary] = useState(false);
  const [deleteGalleryIndex, setDeleteGalleryIndex] = useState(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState(null);

  useEffect(() => {
    async function loadSite() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/sites/${siteId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          const s = data.data.site;
          setFormData({
            name: s.name || '',
            slug: s.slug || '',
            tagline: s.tagline || '',
            description: s.description || '',
            historicalBackground: s.historicalBackground || '',
            state: s.state || '',
            city: s.city || '',
            address: s.address || '',
            latitude: s.latitude ?? 0,
            longitude: s.longitude ?? 0,
            category: s.category || 'Mughal Architecture',
            openTime: s.openingHours?.open || '06:00',
            closeTime: s.openingHours?.close || '18:00',
            weeklyClosingDay: s.weeklyClosingDay || 'None',
            feeIndianAdult: s.entryFee?.indianAdult ?? 50,
            feeSaarcBimstec: s.entryFee?.saarcBimstec ?? 540,
            feeForeignerAdult: s.entryFee?.foreignerAdult ?? 1100,
            feeChild: s.entryFee?.child ?? 0,
            feeMausoleumSupplement: s.entryFee?.mausoleumSupplement ?? 0,
            visitorInstructions: Array.isArray(s.visitorInstructions)
              ? s.visitorInstructions.join('\n')
              : '',
            websiteUrl: s.websiteUrl || '',
            isFeatured: Boolean(s.isFeatured),
            isActive: Boolean(s.isActive),
            maxPerHour: s.demonstrationCapacity?.maxPerHour ?? 1000,
            standardSlotCapacity: s.demonstrationCapacity?.standardSlotCapacity ?? 200,
          });

          // Initialize Destination Images
          const resolvedPrimary = s.image || (Array.isArray(s.images) && s.images[0]) || '';
          setPrimaryImage(resolvedPrimary);
          setPrimaryImageMetadata(s.primaryImageMetadata || null);

          // Initialize structured gallery
          if (Array.isArray(s.gallery) && s.gallery.length > 0) {
            setGallery(
              s.gallery.map((g, idx) => ({
                id: g._id || g.id || `g-${idx}`,
                url: g.url,
                caption: g.caption || '',
                alt: g.alt || '',
                order: g.order ?? idx,
                filename: g.filename || '',
                size: g.size || 0,
                mimeType: g.mimeType || '',
                storageKey: g.storageKey || '',
              }))
            );
          } else if (Array.isArray(s.images) && s.images.length > 1) {
            // Synthesize initial gallery from secondary images
            setGallery(
              s.images.slice(1).map((url, idx) => ({
                id: `legacy-${idx}`,
                url,
                caption: `${s.name} Perspective ${idx + 1}`,
                alt: `${s.name} perspective`,
                order: idx,
                filename: url.split('/').pop()?.split('?')[0] || `image-${idx + 1}`,
                size: 0,
                mimeType: 'image/jpeg',
                storageKey: '',
              }))
            );
          } else {
            setGallery([]);
          }
        } else {
          setError(data.message || 'Failed to load monument.');
        }
      } catch {
        setError('Network error while loading monument.');
      } finally {
        setLoading(false);
      }
    }
    if (siteId) loadSite();
  }, [siteId]);

  // -------------------------------------------------------------
  // PRIMARY IMAGE ACTIONS
  // -------------------------------------------------------------
  const handlePrimaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPrimary(true);
    setUploadError('');
    setImageActionSuccess('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('prefix', 'destinations');

      const res = await fetch('/api/admin/sites/upload-image', {
        method: 'POST',
        body: uploadData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPrimaryImage(json.data.url);
        setPrimaryImageMetadata({
          storageKey: json.data.storageKey,
          filename: json.data.filename,
          size: json.data.size,
          mimeType: json.data.mimeType,
          alt: `${formData.name || 'Monument'} primary banner`,
        });
        setHasUnsavedImageChanges(true);
        setImageActionSuccess('Primary destination image uploaded. Remember to Save Changes to persist.');
      } else {
        setUploadError(json.message || 'Failed to upload primary image.');
      }
    } catch {
      setUploadError('Network communication error during image upload.');
    } finally {
      setIsUploadingPrimary(false);
      if (primaryFileInputRef.current) primaryFileInputRef.current.value = '';
      if (replacePrimaryInputRef.current) replacePrimaryInputRef.current.value = '';
    }
  };

  const handleRemovePrimaryImage = () => {
    setPrimaryImage('');
    setPrimaryImageMetadata(null);
    setConfirmRemovePrimary(false);
    setHasUnsavedImageChanges(true);
    setImageActionSuccess('Primary image removed. A fallback illustration will be used until a new image is set.');
  };

  const handleSetPrimaryFromGallery = (index) => {
    const item = gallery[index];
    if (!item) return;

    setPrimaryImage(item.url);
    setPrimaryImageMetadata({
      storageKey: item.storageKey || '',
      filename: item.filename || '',
      size: item.size || 0,
      mimeType: item.mimeType || '',
      alt: item.alt || item.caption || `${formData.name} primary photograph`,
    });
    setHasUnsavedImageChanges(true);
    setImageActionSuccess(`Set gallery image "${item.caption || item.filename || `#${index + 1}`}" as primary image.`);
  };

  // -------------------------------------------------------------
  // GALLERY IMAGES ACTIONS
  // -------------------------------------------------------------
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingGallery(true);
    setUploadError('');
    setImageActionSuccess('');

    let uploadedCount = 0;
    const newItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('prefix', 'destinations');

        const res = await fetch('/api/admin/sites/upload-image', {
          method: 'POST',
          body: uploadData,
        });

        const json = await res.json();
        if (res.ok && json.success) {
          uploadedCount++;
          newItems.push({
            id: `up-${Date.now()}-${i}`,
            url: json.data.url,
            storageKey: json.data.storageKey,
            filename: json.data.filename,
            size: json.data.size,
            mimeType: json.data.mimeType,
            caption: '',
            alt: `${formData.name || 'Monument'} architectural detail`,
            order: gallery.length + newItems.length,
          });
        } else {
          setUploadError(`Failed to upload ${file.name}: ${json.message}`);
        }
      } catch {
        setUploadError(`Network error while uploading ${file.name}.`);
      }
    }

    if (newItems.length > 0) {
      setGallery((prev) => [...prev, ...newItems]);
      setHasUnsavedImageChanges(true);
      setImageActionSuccess(`Added ${uploadedCount} image(s) to gallery. Click Save Changes to commit.`);
    }

    setIsUploadingGallery(false);
    if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
  };

  const handleReplaceGalleryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null) return;

    const targetIdx = replaceTargetIndex;
    setIsUploadingGallery(true);
    setUploadError('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('prefix', 'destinations');

      const res = await fetch('/api/admin/sites/upload-image', {
        method: 'POST',
        body: uploadData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setGallery((prev) =>
          prev.map((item, idx) => {
            if (idx === targetIdx) {
              return {
                ...item,
                url: json.data.url,
                storageKey: json.data.storageKey,
                filename: json.data.filename,
                size: json.data.size,
                mimeType: json.data.mimeType,
              };
            }
            return item;
          })
        );
        setHasUnsavedImageChanges(true);
        setImageActionSuccess(`Replaced gallery image #${targetIdx + 1}.`);
      } else {
        setUploadError(json.message || 'Failed to replace image.');
      }
    } catch {
      setUploadError('Network error while replacing gallery image.');
    } finally {
      setIsUploadingGallery(false);
      setReplaceTargetIndex(null);
      if (replaceGalleryInputRef.current) replaceGalleryInputRef.current.value = '';
    }
  };

  const handleDeleteGalleryImage = (index) => {
    setGallery((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((item, idx) => ({ ...item, order: idx }));
    });
    setDeleteGalleryIndex(null);
    setHasUnsavedImageChanges(true);
    setImageActionSuccess('Image removed from gallery.');
  };

  const handleMoveGalleryImage = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;

    setGallery((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((item, idx) => ({ ...item, order: idx }));
    });
    setHasUnsavedImageChanges(true);
  };

  const handleCaptionChange = (index, newCaption) => {
    setGallery((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, caption: newCaption } : item))
    );
    setHasUnsavedImageChanges(true);
  };

  // -------------------------------------------------------------
  // MASTER FORM SUBMISSION
  // -------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const normalizedGallery = gallery.map((item, idx) => ({
        url: item.url.trim(),
        storageKey: item.storageKey || '',
        caption: (item.caption || '').trim(),
        alt: (item.alt || item.caption || `${formData.name} perspective`).trim(),
        order: idx,
        filename: item.filename || '',
        size: item.size || 0,
        mimeType: item.mimeType || '',
      }));

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        historicalBackground: formData.historicalBackground.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        category: formData.category.trim(),
        openingHours: {
          open: formData.openTime.trim(),
          close: formData.closeTime.trim(),
        },
        weeklyClosingDay: formData.weeklyClosingDay.trim(),
        entryFee: {
          indianAdult: Number(formData.feeIndianAdult),
          saarcBimstec: Number(formData.feeSaarcBimstec),
          foreignerAdult: Number(formData.feeForeignerAdult),
          child: Number(formData.feeChild),
          mausoleumSupplement: Number(formData.feeMausoleumSupplement),
        },
        visitorInstructions: formData.visitorInstructions
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        websiteUrl: formData.websiteUrl.trim(),
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        // Authoritative Image Management Fields
        image: primaryImage.trim(),
        primaryImageMetadata: primaryImageMetadata || undefined,
        gallery: normalizedGallery,
        // Legacy synchronization
        images: [primaryImage.trim(), ...normalizedGallery.map((g) => g.url)].filter(Boolean),
        demonstrationCapacity: {
          maxPerHour: Number(formData.maxPerHour),
          standardSlotCapacity: Number(formData.standardSlotCapacity),
        },
      };

      const res = await fetch(`/api/admin/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasUnsavedImageChanges(false);
        setSuccessMsg('Monument and destination imagery updated successfully!');
        setTimeout(() => {
          router.push(`/admin/sites/${siteId}`);
        }, 1200);
      } else {
        setError(data.message || 'Failed to update monument.');
      }
    } catch {
      setError('Network communication error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton variant="title" className="w-64 h-8" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl font-sans">
      {/* Top Navigation */}
      <div>
        <Link
          href={`/admin/sites/${siteId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-heritage-charcoal-500 hover:text-heritage-green transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Site Dossier</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-charcoal">
              Edit Monument: {formData.name}
            </h1>
            <p className="text-xs text-heritage-charcoal-400 font-sans mt-1">
              Update official imagery, tariffs, visiting hours, and capacity thresholds.
            </p>
          </div>

          <Link
            href={`/sites/${formData.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-heritage-sandstone/30 hover:border-heritage-green text-heritage-charcoal-600 hover:text-heritage-green text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Page</span>
          </Link>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {hasUnsavedImageChanges && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Unsaved Image Modifications:</strong> You have uploaded or reordered destination images. Click <strong>&quot;Save Changes&quot;</strong> below to publish to the public portal.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-200/80 px-2 py-0.5 rounded font-bold">
            Pending Save
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ========================================================= */}
        {/* SECTION 1: Monument Identity & Taxonomy */}
        {/* ========================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-heritage-sandstone/20">
            <Landmark className="w-4 h-4 text-heritage-green" />
            <h2 className="font-serif text-base font-bold text-heritage-charcoal">
              Monument Identity & Taxonomy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Monument Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Active Status
              </label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 bg-white focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              >
                <option value="true">Active (Public Bookings Enabled)</option>
                <option value="false">Deactivated (Archived from Public View)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: Geographic Location */}
        {/* ========================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-heritage-sandstone/20">
            <MapPin className="w-4 h-4 text-heritage-green" />
            <h2 className="font-serif text-base font-bold text-heritage-charcoal">
              Geographic Location
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                State / UT *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                City / District *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Postal Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: Destination Images & Architectural Gallery */}
        {/* ========================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-heritage-gold/40 shadow-heritage-md space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-heritage-sandstone/25">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-heritage-gold/15 border border-heritage-gold/30 flex items-center justify-center text-heritage-gold-700">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-heritage-charcoal">
                  Destination Images
                </h2>
                <p className="text-xs text-heritage-charcoal-400">
                  Manage primary hero photograph and architectural gallery assets for this monument.
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-heritage-charcoal-500 bg-heritage-ivory px-3 py-1.5 rounded-xl border border-heritage-sandstone/20">
              Supports JPEG, PNG, WebP • Max 5MB
            </div>
          </div>

          {/* Feedback messages */}
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
          {imageActionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{imageActionSuccess}</span>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={primaryFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePrimaryUpload}
          />
          <input
            ref={replacePrimaryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePrimaryUpload}
          />
          <input
            ref={galleryFileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleGalleryUpload}
          />
          <input
            ref={replaceGalleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleReplaceGalleryImage}
          />

          {/* ------------------------------------------------------- */}
          {/* SUBSECTION A: Primary Destination Image */}
          {/* ------------------------------------------------------- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-sm font-bold text-heritage-charcoal flex items-center gap-2">
                  <Star className="w-4 h-4 text-heritage-gold fill-heritage-gold" />
                  Primary Destination Image
                </h3>
                <p className="text-xs text-heritage-charcoal-400 font-sans mt-0.5">
                  Featured on public destination cards, homepage highlights, and hero banner.
                </p>
              </div>

              {primaryImage && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingPrimary}
                    onClick={() => replacePrimaryInputRef.current?.click()}
                    leftIcon={Upload}
                    className="text-xs"
                  >
                    {isUploadingPrimary ? 'Uploading...' : 'Replace Image'}
                  </Button>

                  {!confirmRemovePrimary ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmRemovePrimary(true)}
                      leftIcon={Trash2}
                      className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                    >
                      Remove
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 p-1 bg-rose-50 border border-rose-200 rounded-xl">
                      <span className="text-[11px] font-semibold text-rose-800 px-2">
                        Remove primary image?
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePrimaryImage}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemovePrimary(false)}
                        className="px-2 py-1 text-xs text-heritage-charcoal-600 hover:text-heritage-charcoal"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Primary Image Preview Card */}
            {primaryImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-heritage-sandstone/30 shadow-heritage-sm bg-heritage-sandstone-100">
                <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full max-h-80">
                  <SiteImage
                    src={primaryImage}
                    alt={formData.name || 'Primary monument banner'}
                    aspectRatio="aspect-auto"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-heritage-charcoal/80 text-heritage-gold backdrop-blur-md border border-heritage-gold/30 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-heritage-gold text-heritage-gold" />
                    Active Primary Photograph
                  </span>
                  {primaryImageMetadata?.filename && (
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/60 text-white/90 backdrop-blur-md">
                      {primaryImageMetadata.filename}
                    </span>
                  )}
                </div>

                {/* Image URL preview footer */}
                <div className="p-3 bg-heritage-charcoal/90 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <span className="truncate max-w-lg text-heritage-sandstone-200">
                    Source: {primaryImage}
                  </span>
                  <a
                    href={primaryImage}
                    target="_blank"
                    rel="noreferrer"
                    className="text-heritage-gold hover:underline inline-flex items-center gap-1 shrink-0 font-sans text-xs font-semibold"
                  >
                    <span>Inspect Full Res</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              /* Empty Primary Image State */
              <div className="border-2 border-dashed border-heritage-sandstone/40 rounded-2xl p-8 text-center bg-heritage-ivory/50 hover:bg-heritage-ivory transition-colors">
                <div className="w-12 h-12 rounded-full bg-heritage-sandstone-100 text-heritage-sandstone-600 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-sm font-bold text-heritage-charcoal">
                  No Primary Photograph Set
                </h4>
                <p className="text-xs text-heritage-charcoal-400 mt-1 max-w-md mx-auto">
                  Upload an authentic monument photograph to serve as the signature image on destination cards and headers.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isUploadingPrimary}
                    onClick={() => primaryFileInputRef.current?.click()}
                    leftIcon={Upload}
                    className="bg-heritage-green hover:bg-heritage-green-800"
                  >
                    {isUploadingPrimary ? 'Uploading...' : 'Upload Primary Image'}
                  </Button>
                  {gallery.length > 0 && (
                    <span className="text-xs text-heritage-charcoal-400 font-sans">
                      or choose any image from the gallery below
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------- */}
          {/* SUBSECTION B: Destination Image Gallery */}
          {/* ------------------------------------------------------- */}
          <div className="pt-6 border-t border-heritage-sandstone/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-heritage-charcoal flex items-center gap-2">
                  <Layers className="w-4 h-4 text-heritage-green" />
                  Destination Image Gallery ({gallery.length})
                </h3>
                <p className="text-xs text-heritage-charcoal-400 font-sans mt-0.5">
                  Interior chambers, architectural details, aerial surveys, and surrounding landscapes.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingGallery}
                onClick={() => galleryFileInputRef.current?.click()}
                leftIcon={Upload}
                className="bg-heritage-ivory hover:bg-white text-heritage-charcoal"
              >
                {isUploadingGallery ? 'Uploading Gallery...' : 'Upload Gallery Images'}
              </Button>
            </div>

            {/* Gallery Grid */}
            {gallery.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((item, index) => {
                  const isCurrentPrimary = item.url === primaryImage;
                  return (
                    <div
                      key={item.id || item.url || index}
                      className={`relative rounded-2xl overflow-hidden border transition-all duration-200 bg-white shadow-xs flex flex-col justify-between ${
                        isCurrentPrimary
                          ? 'border-heritage-gold ring-2 ring-heritage-gold/20'
                          : 'border-heritage-sandstone/30 hover:border-heritage-sandstone/60'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[16/10] w-full bg-heritage-sandstone-100 overflow-hidden">
                        <SiteImage
                          src={item.url}
                          alt={item.caption || item.alt || `${formData.name} perspective`}
                          aspectRatio="aspect-auto"
                          className="h-full w-full object-cover"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs">
                            #{index + 1}
                          </span>
                          {isCurrentPrimary && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-heritage-gold text-heritage-charcoal shadow-xs flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Primary
                            </span>
                          )}
                        </div>

                        {/* Order Reorder Controls */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-lg p-0.5 backdrop-blur-xs">
                          <button
                            type="button"
                            title="Move Left / Up"
                            disabled={index === 0}
                            onClick={() => handleMoveGalleryImage(index, -1)}
                            className="p-1 text-white/80 hover:text-white disabled:opacity-30 disabled:hover:text-white/80 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5 sm:rotate-0" />
                          </button>
                          <button
                            type="button"
                            title="Move Right / Down"
                            disabled={index === gallery.length - 1}
                            onClick={() => handleMoveGalleryImage(index, 1)}
                            className="p-1 text-white/80 hover:text-white disabled:opacity-30 disabled:hover:text-white/80 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5 sm:rotate-0" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content & Caption Edit */}
                      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-heritage-charcoal-400 mb-1">
                            Caption & Alternative Text
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Facade of Cave 19 showing chaitya arch"
                            value={item.caption || ''}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-heritage-sandstone/30 focus:outline-none focus:ring-1 focus:ring-heritage-green focus:border-heritage-green font-sans"
                          />
                        </div>

                        {/* Card Action Row */}
                        <div className="pt-2 border-t border-heritage-sandstone/15 flex items-center justify-between gap-1 text-xs">
                          {/* Set as Primary Button */}
                          {!isCurrentPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryFromGallery(index)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-heritage-charcoal hover:text-heritage-gold hover:bg-heritage-sandstone-50 transition-colors"
                            >
                              <Star className="w-3 h-3 text-heritage-gold" />
                              <span>Set Primary</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-heritage-gold inline-flex items-center gap-1 px-1">
                              <Star className="w-3 h-3 fill-heritage-gold" />
                              Current Primary
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            {/* Replace button */}
                            <button
                              type="button"
                              title="Replace this photograph"
                              onClick={() => {
                                setReplaceTargetIndex(index);
                                replaceGalleryInputRef.current?.click();
                              }}
                              className="p-1.5 text-heritage-charcoal-500 hover:text-heritage-green hover:bg-heritage-sandstone-100 rounded-lg transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button with confirmation */}
                            {deleteGalleryIndex === index ? (
                              <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                                <span className="text-[10px] font-bold text-rose-700">Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGalleryImage(index)}
                                  className="text-[10px] font-bold text-rose-600 hover:underline px-1"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteGalleryIndex(null)}
                                  className="text-[10px] text-heritage-charcoal-500 hover:text-heritage-charcoal"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                title="Delete image"
                                onClick={() => setDeleteGalleryIndex(index)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Gallery State */
              <div className="border border-dashed border-heritage-sandstone/30 rounded-2xl p-8 text-center bg-heritage-ivory/30">
                <div className="w-10 h-10 rounded-full bg-heritage-sandstone-100 text-heritage-sandstone-600 flex items-center justify-center mx-auto mb-2">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-bold text-heritage-charcoal">
                  No Gallery Images
                </h4>
                <p className="text-xs text-heritage-charcoal-400 mt-1 max-w-sm mx-auto">
                  Upload architectural perspectives, rock-cut details, and sanctum photographs to enrich visitor discovery on the public portal.
                </p>
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingGallery}
                    onClick={() => galleryFileInputRef.current?.click()}
                    leftIcon={Upload}
                    className="text-xs"
                  >
                    Add Gallery Images
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: Tariff Schedule */}
        {/* ========================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-heritage-sandstone/20">
            <IndianRupee className="w-4 h-4 text-heritage-green" />
            <h2 className="font-serif text-base font-bold text-heritage-charcoal">
              Official ASI Tariffs (₹ INR)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Indian Adult
              </label>
              <input
                type="number"
                min="0"
                value={formData.feeIndianAdult}
                onChange={(e) => setFormData({ ...formData, feeIndianAdult: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 font-mono focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                SAARC / BIMSTEC
              </label>
              <input
                type="number"
                min="0"
                value={formData.feeSaarcBimstec}
                onChange={(e) => setFormData({ ...formData, feeSaarcBimstec: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 font-mono focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Foreign Tourist
              </label>
              <input
                type="number"
                min="0"
                value={formData.feeForeignerAdult}
                onChange={(e) => setFormData({ ...formData, feeForeignerAdult: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 font-mono focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Child (Below 15)
              </label>
              <input
                type="number"
                min="0"
                value={formData.feeChild}
                onChange={(e) => setFormData({ ...formData, feeChild: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 font-mono focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Mausoleum Addon
              </label>
              <input
                type="number"
                min="0"
                value={formData.feeMausoleumSupplement}
                onChange={(e) => setFormData({ ...formData, feeMausoleumSupplement: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 font-mono focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 5: Narrative Description */}
        {/* ========================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-heritage-sandstone/20">
            <Layers className="w-4 h-4 text-heritage-green" />
            <h2 className="font-serif text-base font-bold text-heritage-charcoal">
              Narrative & Visitor Guidelines
            </h2>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Historical Background
              </label>
              <textarea
                rows={3}
                value={formData.historicalBackground}
                onChange={(e) => setFormData({ ...formData, historicalBackground: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>

            <div>
              <label className="block font-semibold text-heritage-charcoal mb-1">
                Visitor Instructions (One per line)
              </label>
              <textarea
                rows={3}
                value={formData.visitorInstructions}
                onChange={(e) => setFormData({ ...formData, visitorInstructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-sandstone/30 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-heritage-green/20 focus:border-heritage-green"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-heritage-sandstone/20">
          <div className="text-xs text-heritage-charcoal-400 font-sans">
            {hasUnsavedImageChanges ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Unsaved changes will be applied upon saving
              </span>
            ) : (
              <span>All changes will be updated atomically in the national database.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button href={`/admin/sites/${siteId}`} variant="outline">
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              leftIcon={Save}
              className="bg-heritage-green hover:bg-heritage-green-800"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
