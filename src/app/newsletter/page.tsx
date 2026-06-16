'use client';

import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, Star, Mail, CheckCircle } from 'lucide-react';
import { db } from '@/db/database';
import { useAppStore } from '@/store/useAppStore';

const NEWSLETTER_ARTICLES = [
  {
    code: 'RH-08',
    category: 'RHEOLOGY & GELS',
    title: 'Gelling Synergies in Low-Solid Media',
    date: 'June 2026',
    readTime: '8 MIN READ',
    summary: 'An exploration of shear viscosity thresholds for Kappa-2 Carrageenan under fluctuating storage temperatures. Analyzing why cocoa particle suspension breaks down after day 40 in dairy stabilizers.',
    highlights: ['Kappa-Iota ratio synergy', 'Cocoa protein interactions', 'Viscometer shear mapping']
  },
  {
    code: 'OPS-12',
    category: 'LOGISTICS & SUPPLY',
    title: 'The Seaweed Sourcing Bottleneck',
    date: 'May 2026',
    readTime: '12 MIN READ',
    summary: 'How maritime freight volatility and seaweed harvesting patterns in the Indo-Pacific dictate real-time B2B stabilizer pricing. Adapting formulations to buffer raw material variance.',
    highlights: ['Red Seaweed supply chains', 'Moisture coefficient targets', 'Buffer formulation systems']
  },
  {
    code: 'SYS-03',
    category: 'SYSTEMS ARCHITECTURE',
    title: 'Offline-First ERPs for Tech Founders',
    date: 'April 2026',
    readTime: '10 MIN READ',
    summary: 'A deep dive into why local-first databases like Dexie.js and IndexedDB outperform cloud-native solutions for operational execution. Implementing the digital twin replica.',
    highlights: ['IndexedDB seed scripts', 'State synchronization keys', 'Local-first security']
  },
  {
    code: 'REG-05',
    category: 'REGULATORY LAW',
    title: 'FSSAI Stabilizer Compliance Standards',
    date: 'March 2026',
    readTime: '6 MIN READ',
    summary: 'Preparing documentation for food safety approvals of modified polysaccharide thickeners. Translating chemical additives definitions into actionable audit logs.',
    highlights: ['FSSAI Category 12.1.2', 'Heavy metal limits', 'Toxicological filing reports']
  }
];

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await db.leads.add({
        companyName: 'Interactions Newsletter',
        contactPerson: 'Newsletter Subscriber',
        email: email,
        status: 'Lead',
        createdAt: new Date().toISOString()
      });
      useAppStore.getState().addNotification(`Newsletter subscription logged for: ${email}`);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Error saving subscriber:', err);
      alert('Subscription failed. Please check local database settings.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#2E3A47] pb-24">
      
      {/* ─── Editorial Cover ─── */}
      <section className="bg-[#1B2B3B] text-[#F9F8F5] py-24 px-6 md:px-12 relative overflow-hidden border-b border-[#F9F8F5]/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,107,110,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-6 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4892A] font-bold">EDITORIAL PUBLICATION // JOURNAL</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-widest uppercase leading-none">
            Interactions
          </h1>
          <div className="h-[1px] w-20 bg-[#C4892A]/30 mx-auto my-2" />
          <p className="text-sm md:text-base font-mono tracking-widest uppercase text-[#F9F8F5]/70 max-w-2xl mx-auto">
            Translating complex hydrocolloid physics, food logistics, and systems thinking into actionable B2B formulation strategies.
          </p>
        </div>
      </section>

      {/* ─── Two-Column Feed ─── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left Column: Subscriptions & Manifest */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Magazine Masthead */}
          <div className="border border-[#1B2B3B]/10 bg-[#F9F8F5] rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3A6B6E] font-bold">JOURNAL MASTHEAD</span>
            <h3 className="text-lg font-serif font-bold text-[#1B2B3B] uppercase">About Interactions</h3>
            <p className="text-xs text-[#2E3A47]/80 leading-relaxed font-serif">
              Published monthly, *Interactions* explores the chemical bonds that hold beverages together, the supply routes that deliver raw inputs, and the digital tools that orchestrate operations. It acts as the intellectual layer of **KGOS X 2031**.
            </p>
            <div className="h-[1px] bg-[#1B2B3B]/10" />
            <div className="flex justify-between items-center text-[10px] font-mono text-[#2E3A47]/60">
              <span>FREQUENCY: MONTHLY</span>
              <span>ISSN: 2031-897X</span>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="border border-[#C4892A]/30 bg-[#1B2B3B] text-[#F9F8F5] rounded-xl p-6 shadow-md flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C4892A]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 text-[#C4892A]">
              <Mail className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">SUBSCRIBE DIRECTLY</span>
            </div>

            <h3 className="text-xl font-serif text-[#F9F8F5] uppercase">Join the Reader Ledger</h3>
            <p className="text-xs text-[#F9F8F5]/70 leading-relaxed">
              Get raw formulation logs, seaweed pricing alerts, and systems analysis articles straight to your inbox. No fluff, just hard engineering.
            </p>

            {subscribed ? (
              <div className="bg-[#3A6B6E]/20 border border-[#3A6B6E]/40 p-4 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#3A6B6E] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-mono font-bold text-[#F9F8F5] block">Subscription Logged</span>
                  <span className="text-[10px] text-[#F9F8F5]/60 font-mono">Logged directly to leads database. Welcome.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="bg-[#F9F8F5]/10 border border-[#F9F8F5]/20 rounded-lg px-4 py-2.5 text-xs text-[#F9F8F5] outline-none focus:border-[#C4892A] font-mono"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#C4892A] hover:bg-[#C4892A]/90 text-[#F9F8F5] text-xs font-mono font-bold rounded-lg transition-all tracking-widest uppercase cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Column: Articles Grid (2 cols equivalent) */}
        <div className="lg:col-span-2 flex flex-col gap-12">
          
          <div className="border-b border-[#1B2B3B]/10 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3A6B6E] font-bold">01 / RECENT JOURNAL ISSUES</span>
            <h2 className="text-2xl font-serif text-[#1B2B3B] font-bold uppercase mt-1">Research & Formulation Logs</h2>
          </div>

          <div className="flex flex-col gap-10">
            {NEWSLETTER_ARTICLES.map((art, idx) => (
              <article key={idx} className="group flex flex-col gap-4 border-b border-[#1B2B3B]/5 pb-10 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 text-[10px] font-mono text-[#2E3A47]/60">
                  <span className="font-bold text-[#C4892A] tracking-wider">{art.code}</span>
                  <span className="h-1 w-1 bg-[#2E3A47]/20 rounded-full" />
                  <span>{art.category}</span>
                  <span className="h-1 w-1 bg-[#2E3A47]/20 rounded-full" />
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-[#1B2B3B] group-hover:text-[#C4892A] transition-colors leading-tight">
                  {art.title}
                </h3>

                <p className="text-sm font-serif text-[#2E3A47]/80 leading-relaxed">
                  {art.summary}
                </p>

                {/* Tag highlights */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {art.highlights.map((h, hidx) => (
                    <span key={hidx} className="px-2 py-0.5 bg-[#1B2B3B]/5 rounded text-[9px] font-mono uppercase tracking-wider text-[#3A6B6E]">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-[#2E3A47]/50 mt-2">
                  <span>PUBLISHED: {art.date}</span>
                  <span className="text-[#1B2B3B] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                    READ ARTICLE <ArrowRight className="w-3.5 h-3.5 text-[#C4892A]" />
                  </span>
                </div>
              </article>
            ))}
          </div>

        </div>

      </section>

    </div>
  );
}
