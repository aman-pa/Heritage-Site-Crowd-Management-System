'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Landmark,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Edit2,
  Power,
  ExternalLink,
  Shield,
  Layers,
  AlertCircle,
  Ticket,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminSiteDetailPage({ params }) {
  const router = useRouter();
  const siteId = params.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSite = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/admin/sites/${siteId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Unable to retrieve monument details.');
      }
    } catch {
      setError('Network communication error while loading monument.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) fetchSite();
  }, [siteId]);

  const handleToggleStatus = async () => {
    if (!data?.site) return;
    try {
      const res = await fetch(`/api/admin/sites/${data.site.id}/toggle-status`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData((prev) => ({
          ...prev,
          site: { ...prev.site, isActive: json.data.isActive },
        }));
      } else {
        alert(json.message || 'Failed to update site status.');
      }
    } catch {
      alert('Network error while toggling status.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton variant="title" className="w-64 h-8" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (error || !data?.site) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="font-serif text-xl font-bold text-heritage-charcoal">
          Monument Dossier Unavailable
        </h2>
        <p className="text-xs text-heritage-charcoal-400 font-sans">
          {error || 'The requested heritage site could not be found.'}
        </p>
        <Button href="/admin/sites" variant="outline">
          Back to Monuments
        </Button>
      </div>
    );
  }

  const { site, stats } = data;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-heritage-sandstone/30">
        <div>
          <Link
            href="/admin/sites"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-heritage-charcoal-500 hover:text-heritage-green transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Monuments</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-charcoal">
              {site.name}
            </h1>
            <Badge variant={site.isActive ? 'success' : 'danger'}>
              {site.isActive ? 'Active' : 'Deactivated'}
            </Badge>
          </div>
          <p className="text-xs text-heritage-charcoal-400 font-mono mt-1">
            /{site.slug} • {site.city}, {site.state}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/sites/${site.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-heritage-sandstone/30 hover:border-heritage-green text-heritage-charcoal-600 hover:text-heritage-green text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Page</span>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            leftIcon={Power}
            className={site.isActive ? 'text-amber-700 border-amber-300' : 'text-emerald-700 border-emerald-300'}
          >
            {site.isActive ? 'Deactivate' : 'Activate'}
          </Button>

          <Button
            href={`/admin/sites/${site.id}/edit`}
            variant="primary"
            size="sm"
            leftIcon={Edit2}
            className="bg-heritage-green hover:bg-heritage-green-800"
          >
            Edit Monument
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-heritage-charcoal-400 font-semibold">
            Total Bookings
          </span>
          <p className="font-serif text-2xl font-bold text-heritage-charcoal">
            {stats?.totalBookings ?? 0}
          </p>
          <p className="text-[11px] text-heritage-charcoal-400">
            {stats?.confirmedBookings ?? 0} confirmed passes
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-heritage-charcoal-400 font-semibold">
            Active Time Slots
          </span>
          <p className="font-serif text-2xl font-bold text-heritage-charcoal">
            {stats?.activeSlots ?? 0}
          </p>
          <p className="text-[11px] text-heritage-charcoal-400">Available intervals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-heritage-charcoal-400 font-semibold">
            Slot Capacity Standard
          </span>
          <p className="font-serif text-2xl font-bold text-heritage-green">
            {site.demonstrationCapacity?.standardSlotCapacity ?? 200}
          </p>
          <p className="text-[11px] text-heritage-charcoal-400">Standard quota / window</p>
        </div>
      </div>

      {/* Detailed Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Imagery, Description, History, Guidelines */}
        <div className="lg:col-span-8 space-y-6">
          {/* Monument Photography Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-heritage-green" />
                <h2 className="font-serif text-lg font-bold text-heritage-charcoal">
                  Monument Imagery
                </h2>
              </div>
              <Link
                href={`/admin/sites/${site.id}/edit`}
                className="text-xs text-heritage-green hover:underline font-semibold"
              >
                Manage Photography
              </Link>
            </div>

            {/* Primary Image Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-heritage-charcoal-400 font-semibold block">
                Primary Landmark Image
              </span>
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-heritage-sandstone-100 border border-heritage-sandstone/30">
                {site.image ? (
                  <Image
                    src={site.image}
                    alt={site.primaryImageMetadata?.alt || site.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-heritage-charcoal-400">
                    <Landmark className="w-12 h-12 mb-2 text-heritage-sandstone-400" />
                    <span className="text-xs">No primary image assigned</span>
                  </div>
                )}
                {site.primaryImageMetadata?.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                    <p className="text-xs font-serif italic">
                      {site.primaryImageMetadata.caption}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Images */}
            {site.gallery && site.gallery.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-heritage-sandstone/20">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-heritage-charcoal-500" />
                  <span className="text-xs font-semibold text-heritage-charcoal">
                    Architectural Perspectives ({site.gallery.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {site.gallery.map((item, idx) => {
                    const url = typeof item === 'string' ? item : item.url;
                    const caption = typeof item === 'string' ? '' : item.caption;
                    const alt = typeof item === 'string' ? `${site.name} gallery image ${idx + 1}` : item.alt;

                    return (
                      <div
                        key={idx}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-heritage-sandstone-100 border border-heritage-sandstone/30"
                      >
                        <Image
                          src={url}
                          alt={alt || `${site.name} angle`}
                          fill
                          sizes="200px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white truncate text-center">
                              {caption}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-heritage-charcoal">
              Overview & Architectural Identity
            </h2>
            <p className="text-xs text-heritage-charcoal-600 font-sans leading-relaxed whitespace-pre-line">
              {site.description}
            </p>

            {site.historicalBackground && (
              <div className="pt-4 border-t border-heritage-sandstone/20 space-y-2">
                <h3 className="font-serif text-sm font-bold text-heritage-charcoal">
                  Historical Background
                </h3>
                <p className="text-xs text-heritage-charcoal-600 font-sans leading-relaxed whitespace-pre-line">
                  {site.historicalBackground}
                </p>
              </div>
            )}
          </div>

          {/* Visitor Guidelines */}
          {site.visitorInstructions?.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-heritage-charcoal">
                Turnstile Guidelines & Regulations
              </h2>
              <ul className="space-y-2 text-xs font-sans text-heritage-charcoal-600">
                {site.visitorInstructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-heritage-green mt-1.5 shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Tariffs, Hours, Geography */}
        <div className="lg:col-span-4 space-y-6">
          {/* Official ASI Tariff Card */}
          <div className="bg-white p-6 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-heritage-green" />
              <h3 className="font-serif text-base font-bold text-heritage-charcoal">
                Official ASI Tariffs
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-sans divide-y divide-heritage-sandstone/15">
              <div className="flex justify-between items-center pt-2">
                <span className="text-heritage-charcoal-600">Indian Adult</span>
                <span className="font-mono font-bold text-heritage-charcoal">
                  ₹{site.entryFee?.indianAdult ?? 50}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-heritage-charcoal-600">SAARC / BIMSTEC</span>
                <span className="font-mono font-bold text-heritage-charcoal">
                  ₹{site.entryFee?.saarcBimstec ?? 540}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-heritage-charcoal-600">Foreign Tourist</span>
                <span className="font-mono font-bold text-heritage-charcoal">
                  ₹{site.entryFee?.foreignerAdult ?? 1100}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-heritage-charcoal-600">Child (Under 15)</span>
                <span className="font-mono font-bold text-emerald-700">₹0 (Free)</span>
              </div>
              {site.entryFee?.mausoleumSupplement > 0 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-heritage-charcoal-600">Mausoleum Addon</span>
                  <span className="font-mono font-bold text-heritage-gold-600">
                    +₹{site.entryFee.mausoleumSupplement}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Operating Schedule Card */}
          <div className="bg-white p-6 rounded-3xl border border-heritage-sandstone/30 shadow-heritage-sm space-y-3 text-xs font-sans">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-heritage-green" />
              <h3 className="font-serif text-base font-bold text-heritage-charcoal">
                Operational Schedule
              </h3>
            </div>

            <div className="space-y-2 text-heritage-charcoal-600">
              <p>
                <strong>Hours:</strong> {site.openingHours?.open} – {site.openingHours?.close}
              </p>
              <p>
                <strong>Weekly Closed Day:</strong> {site.weeklyClosingDay || 'None'}
              </p>
              <p>
                <strong>Location:</strong> {site.address || `${site.city}, ${site.state}`}
              </p>
              <p className="font-mono text-[11px] text-heritage-charcoal-400">
                Lat: {site.latitude} • Lng: {site.longitude}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
