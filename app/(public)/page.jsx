'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  BarChart3,
  Clock,
  Landmark,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import SiteCard from '@/components/site/SiteCard';
import CrowdBadge from '@/components/crowd/CrowdBadge';
import CrowdGauge from '@/components/crowd/CrowdGauge';
import { HERITAGE_SITES } from '@/constants/heritageSites';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sites, setSites] = useState(HERITAGE_SITES);

  // Dynamically resolve live administrator-managed monument images from MongoDB
  useEffect(() => {
    async function loadLiveSites() {
      try {
        const res = await fetch('/api/sites');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data?.sites) && data.data.sites.length > 0) {
          setSites(data.data.sites);
        }
      } catch (err) {
        // Fallback already populated with HERITAGE_SITES
      }
    }
    loadLiveSites();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  }

  // Aggregate simulated metrics
  const totalDestinations = HERITAGE_SITES.length;
  const totalCurrentSimulated = HERITAGE_SITES.reduce(
    (acc, s) => acc + (s.capacity?.currentSimulatedVisitors || 0),
    0
  );
  const totalMaxCapacity = HERITAGE_SITES.reduce(
    (acc, s) => acc + (s.capacity?.maxInstantaneous || 0),
    0
  );
  const aggregateOccupancy = Math.round((totalCurrentSimulated / totalMaxCapacity) * 100);

  return (
    <div className="flex flex-col">
      {/* SECTION A: Hero Section */}
      <section className="relative overflow-hidden bg-heritage-charcoal text-heritage-ivory pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-32 lg:pb-40 border-b border-heritage-gold/20">
        {/* Background Image with Darkened Editorial Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2000&q=85"
            alt="Taj Mahal under morning sky"
            fill
            priority
            className="object-cover object-center opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-heritage-charcoal via-heritage-charcoal/85 to-heritage-charcoal/60" />
        </div>

        <Container size="xl" className="relative z-10">
          <div className="max-w-3xl">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-heritage-gold/15 text-heritage-gold-300 border border-heritage-gold/25 mb-5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-heritage-gold" />
              <span>Smart Tourism & Monument Preservation</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Experience India's Heritage with Intelligent Crowd Management
            </h1>

            <p className="mt-5 text-base sm:text-lg text-heritage-sandstone-200 leading-relaxed font-sans max-w-2xl">
              ANVAYA connects visitors with India's timeless monuments through real-time crowd insights, time-slotted bookings, and conservation-focused capacity management.
            </p>

            {/* Quick Hero Search Input */}
            <form onSubmit={handleSearchSubmit} className="mt-7 max-w-xl">
              <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white p-1.5 border border-heritage-sandstone/20">
                <Search className="w-5 h-5 text-heritage-charcoal-400 ml-3 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search monuments (Taj Mahal, Red Fort, Hampi...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm text-heritage-charcoal placeholder-heritage-charcoal-400 bg-transparent focus:outline-none font-sans"
                />
                <Button type="submit" variant="primary" size="md" className="shrink-0">
                  Search
                </Button>
              </div>
            </form>

            {/* Primary Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button href="/explore" variant="gold" size="lg" rightIcon={ArrowRight}>
                Explore Destinations
              </Button>
              <Button href="/crowd-status" variant="outline" size="lg" className="text-white border-white/40 hover:bg-white/10 hover:border-white/60">
                View Crowd Status
              </Button>
            </div>

            {/* Fast Stats Bar */}
            <div className="mt-10 pt-7 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-sans text-heritage-sandstone-300">
              <div>
                <span className="block font-serif text-2xl sm:text-3xl font-bold text-white">6</span>
                <span className="text-xs text-heritage-sandstone-400 mt-0.5 block">Pilot Sites</span>
              </div>
              <div>
                <span className="block font-serif text-2xl sm:text-3xl font-bold text-white">3</span>
                <span className="text-xs text-heritage-sandstone-400 mt-0.5 block">Crowd Levels</span>
              </div>
              <div>
                <span className="block font-serif text-2xl sm:text-3xl font-bold text-white">100%</span>
                <span className="text-xs text-heritage-sandstone-400 mt-0.5 block">Capacity Control</span>
              </div>
              <div>
                <span className="block font-serif text-2xl sm:text-3xl font-bold text-white">UNESCO</span>
                <span className="text-xs text-heritage-sandstone-400 mt-0.5 block">World Heritage</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION B: Featured Destinations */}
      <section className="py-16 sm:py-20 bg-heritage-ivory border-b border-heritage-sandstone/15">
        <Container size="xl">
          <SectionHeading
            eyebrow="Explore Destinations"
            title="Featured Heritage Monuments"
            description="Discover historical context, architectural highlights, visiting hours, and live crowd density across our pilot monuments."
            action={
              <Button href="/explore" variant="outline" size="md" rightIcon={ArrowRight}>
                View All Sites
              </Button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <SiteCard key={site.id || site.slug} site={site} />
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION C: Smart Crowd Monitoring Introduction */}
      <section className="py-16 sm:py-20 bg-heritage-sandstone-50/40 border-b border-heritage-sandstone/15">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-heritage-sandstone-700 bg-heritage-sandstone-100 px-2.5 py-1 rounded-md border border-heritage-sandstone-200 inline-block">
                Intelligent Visitor Flow
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-charcoal tracking-tight leading-tight">
                How ANVAYA Prevents Overcrowding
              </h2>

              <p className="text-sm sm:text-base text-heritage-charcoal-700 leading-relaxed font-sans">
                Heritage monuments have fragile carrying capacities. Tourist surges cause environmental wear and degraded visitor experiences. ANVAYA models capacity in real time, categorizing crowd flow into three actionable states:
              </p>

              {/* 3 Tier Explanation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-lg bg-white border border-emerald-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-800 font-semibold text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Low (0–40%)
                  </div>
                  <p className="text-xs text-heritage-charcoal-600 leading-relaxed">
                    Optimal visit window with minimal crowds.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-amber-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5 text-amber-800 font-semibold text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Moderate (41–70%)
                  </div>
                  <p className="text-xs text-heritage-charcoal-600 leading-relaxed">
                    Standard flow with minor queuing.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-rose-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5 text-rose-800 font-semibold text-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    High (71–100%)
                  </div>
                  <p className="text-xs text-heritage-charcoal-600 leading-relaxed">
                    Peak density, entry throttled.
                  </p>
                </div>
              </div>

              {/* Conservation Advisory */}
              <div className="p-4 rounded-xl bg-heritage-ivory border border-heritage-sandstone/30 flex items-start gap-3 text-sm text-heritage-charcoal-700">
                <ShieldCheck className="w-5 h-5 text-heritage-green shrink-0 mt-0.5" />
                <p>
                  <strong className="font-semibold">Carrying Capacity Standards:</strong> Real-time occupancy monitoring balances public access with structural conservation.
                </p>
              </div>

              <div className="pt-3">
                <Button href="/crowd-status" variant="primary" size="md" rightIcon={BarChart3}>
                  View Live Crowd Dashboard
                </Button>
              </div>
            </div>

            {/* Right Telemetry Snapshot Card */}
            <div className="lg:col-span-5">
              <Card className="p-6 sm:p-7 border-heritage-sandstone/40">
                <div className="flex items-center justify-between pb-4 border-b border-heritage-sandstone/15">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-heritage-sandstone-700 bg-heritage-sandstone-100 px-2 py-0.5 rounded">
                      System Overview
                    </span>
                    <h3 className="font-serif text-xl font-bold text-heritage-charcoal mt-2">
                      Current Occupancy
                    </h3>
                  </div>
                  <CrowdBadge percentage={aggregateOccupancy} />
                </div>

                <div className="my-6 flex flex-col items-center justify-center text-center">
                  <CrowdGauge percentage={aggregateOccupancy} size="lg" />
                  <p className="text-xs text-heritage-charcoal-500 mt-3 font-sans">
                    Average across all 6 pilot monuments
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-heritage-sandstone/15 text-sm">
                  <div className="flex justify-between py-1.5">
                    <span className="text-heritage-charcoal-600">Current Visitors:</span>
                    <strong className="text-heritage-charcoal font-semibold">
                      {totalCurrentSimulated.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-heritage-charcoal-600">Maximum Capacity:</span>
                    <strong className="text-heritage-charcoal font-semibold">
                      {totalMaxCapacity.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-heritage-charcoal-600">Available Slots:</span>
                    <strong className="text-emerald-700 font-semibold">
                      {(totalMaxCapacity - totalCurrentSimulated).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="mt-5">
                  <Button href="/crowd-status" variant="outline" size="sm" className="w-full justify-center">
                    View Full Dashboard
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION D: Why Choose ANVAYA */}
      <section className="py-16 sm:py-20 bg-heritage-ivory border-b border-heritage-sandstone/15">
        <Container size="xl">
          <SectionHeading
            eyebrow="Platform Features"
            title="Why Choose ANVAYA"
            description="A modern heritage tourism platform built for visitors, curators, and monument preservation."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-6 text-left hover:shadow-heritage-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-heritage-sandstone-100 flex items-center justify-center text-heritage-sandstone-700 mb-4 border border-heritage-sandstone-200">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-heritage-charcoal mb-2">
                Historical Context
              </h3>
              <p className="text-sm text-heritage-charcoal-600 leading-relaxed font-sans">
                Curated narratives, architectural details, and verified archaeological facts from official records.
              </p>
            </Card>

            <Card className="p-6 text-left hover:shadow-heritage-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-heritage-green-50 flex items-center justify-center text-heritage-green mb-4 border border-heritage-green-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-heritage-charcoal mb-2">
                Real-Time Crowd Data
              </h3>
              <p className="text-sm text-heritage-charcoal-600 leading-relaxed font-sans">
                Live density classifications help you choose optimal visit times and avoid long queues.
              </p>
            </Card>

            <Card className="p-6 text-left hover:shadow-heritage-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-heritage-gold-50 flex items-center justify-center text-heritage-gold-800 mb-4 border border-heritage-gold-200">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-heritage-charcoal mb-2">
                Time-Slotted Booking
              </h3>
              <p className="text-sm text-heritage-charcoal-600 leading-relaxed font-sans">
                Reserve specific entry windows to eliminate overbooking and guarantee your visit.
              </p>
            </Card>

            <Card className="p-6 text-left hover:shadow-heritage-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800 mb-4 border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-heritage-charcoal mb-2">
                Conservation Focus
              </h3>
              <p className="text-sm text-heritage-charcoal-600 leading-relaxed font-sans">
                Capacity limits protect fragile monuments from degradation caused by overcrowding.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* SECTION E: Travel Planning CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-heritage-green via-heritage-green-600 to-heritage-green-700 text-heritage-ivory">
        <Container size="xl">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-heritage-gold/20 text-heritage-gold-300 border border-heritage-gold/30">
              <Sparkles className="w-3.5 h-3.5 text-heritage-gold" />
              Begin Your Journey
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to Experience India's Architectural Wonders?
            </h2>

            <p className="text-sm sm:text-base text-heritage-sandstone-200 font-sans leading-relaxed max-w-2xl mx-auto">
              Explore monuments, compare crowd levels, and book time-slotted passes for an unforgettable heritage journey.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Button href="/explore" variant="gold" size="lg" rightIcon={Compass}>
                Explore All Monuments
              </Button>
              <Button
                href="/about"
                variant="outline"
                size="lg"
                className="text-white border-white/40 hover:bg-white/10 hover:border-white/60"
              >
                Learn About ANVAYA
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
