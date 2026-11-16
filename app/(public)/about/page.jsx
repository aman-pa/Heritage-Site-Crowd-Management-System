import Link from 'next/link';
import {
  Landmark,
  ShieldCheck,
  Users,
  Compass,
  Sparkles,
  BarChart3,
  CalendarCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Logo from '@/components/brand/Logo';

export const metadata = {
  title: 'About ANVAYA – Smart Tourism & Heritage Preservation Platform',
  description:
    "Learn about ANVAYA's mission to balance Indian heritage monument conservation with intelligent carrying-capacity crowd management.",
};

export default function AboutPage() {
  return (
    <div className="py-10 sm:py-16 bg-heritage-ivory min-h-screen font-sans">
      <Container size="xl">
        {/* Page Header */}
        <SectionHeading
          eyebrow="About ANVAYA"
          title="Smart Tourism & Heritage Preservation"
          description="A platform engineered to preserve India's cultural heritage through intelligent visitor flow management and capacity governance."
        />

        {/* Narrative Section 1: The Core Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-14">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-heritage-sandstone-700 bg-heritage-sandstone-100 px-2.5 py-1 rounded inline-block">
              Our Mission
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-charcoal leading-tight">
              Balancing Access with Preservation
            </h2>

            <p className="text-sm sm:text-base text-heritage-charcoal-700 leading-relaxed">
              India is home to thousands of monumental structures representing centuries of artistic and architectural genius. Iconic destinations like the <strong>Taj Mahal</strong>, <strong>Red Fort</strong>, and <strong>Qutub Minar</strong> attract millions of visitors annually.
            </p>

            <p className="text-sm text-heritage-charcoal-600 leading-relaxed">
              However, unmanaged mass tourism threatens these fragile wonders. Excessive footfall creates structural vibrations, surface abrasion, humidity fluctuations, and pedestrian bottlenecks that degrade both monuments and visitor experiences.
            </p>

            <p className="text-sm text-heritage-charcoal-600 leading-relaxed">
              <strong className="text-heritage-green font-semibold">ANVAYA</strong> solves this through <strong>Intelligent Capacity Management</strong>: providing tourists with advance crowd visibility and offering curators tools to prevent overbooking.
            </p>
          </div>

          <div className="lg:col-span-5">
            <Card className="p-7 bg-gradient-to-br from-white to-heritage-sandstone-50/60 border-heritage-sandstone/40 space-y-4 shadow-heritage-md">
              <div className="mb-3 flex justify-center">
                <Logo variant="full" size="xl" />
              </div>
              <h3 className="font-serif text-xl font-bold text-heritage-charcoal text-center">
                Platform Objectives
              </h3>
              <ul className="space-y-2.5 text-sm text-heritage-charcoal-700 font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-heritage-green mt-2 shrink-0" />
                  <span>Empower tourists to choose optimal visit windows</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-heritage-green mt-2 shrink-0" />
                  <span>Enforce architectural carrying capacity limits</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-heritage-green mt-2 shrink-0" />
                  <span>Provide transparent historical context</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-heritage-green mt-2 shrink-0" />
                  <span>Support time-slotted reservations with zero overbooking</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Four Key Pillars */}
        <div className="mb-14">
          <SectionHeading
            eyebrow="Core Features"
            title="Four Pillars of Smart Tourism"
            description="The foundational tenets of ANVAYA's technical and operational approach."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-6 hover:shadow-heritage-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-heritage-green-50 text-heritage-green flex items-center justify-center mb-4 border border-heritage-green-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-heritage-charcoal mb-2">
                Density Classification
              </h3>
              <p className="text-sm text-heritage-charcoal-600 leading-relaxed">
                Real-time occupancy categorized into Low (0–40%), Moderate (41–70%), and High (71–100%) thresholds.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-heritage-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-heritage-sandstone-100 text-heritage-sandstone-800 flex items-center justify-center mb-4 border border-heritage-sandstone-300">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-heritage-charcoal mb-2">
                Slotted Reservations
              </h3>
              <p className="text-sm text-heritage-charcoal-600 leading-relaxed">
                Staggered 2-hour entry windows replace chaotic queues and level visitor inflow throughout the day.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-heritage-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-heritage-gold-50 text-heritage-gold-800 flex items-center justify-center mb-4 border border-heritage-gold-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-heritage-charcoal mb-2">
                Monument Protection
              </h3>
              <p className="text-sm text-heritage-charcoal-600 leading-relaxed">
                Protects fragile structures from microclimatic stress and physical wear caused by overcrowding.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-heritage-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-heritage-charcoal mb-2">
                Historical Context
              </h3>
              <p className="text-sm text-heritage-charcoal-600 leading-relaxed">
                Vetted archaeological information, architectural details, and official visiting guidelines.
              </p>
            </Card>
          </div>
        </div>

        {/* Heritage Conservation & Tourism Mission */}
        <div className="bg-heritage-charcoal text-heritage-sandstone-200 rounded-2xl p-8 sm:p-10 border border-heritage-gold/25 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-heritage-sandstone/15">
            <Sparkles className="w-6 h-6 text-heritage-gold" />
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Heritage Conservation & Tourism Excellence
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-heritage-charcoal-300 leading-relaxed font-sans">
            <div className="space-y-3">
              <h4 className="font-serif text-lg font-bold text-white">
                Intelligent Visitor Distribution
              </h4>
              <p>
                ANVAYA uses capacity models and hourly quotas to safeguard stone architecture against degradation from microclimatic fluctuations and structural strain.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif text-lg font-bold text-white">
                Guaranteed Access
              </h4>
              <p>
                By scheduling entry windows, visitors avoid long queues and experience India's heritage under ideal conditions with peaceful ambiance.
              </p>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Button href="/explore" variant="gold" size="md" rightIcon={Compass}>
              Explore Monuments
            </Button>
            <Button
              href="/crowd-status"
              variant="outline"
              size="md"
              className="text-heritage-sandstone border-heritage-sandstone/40 hover:bg-heritage-sandstone/10"
            >
              View Crowd Status
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
