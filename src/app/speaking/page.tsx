'use client';

import React from 'react';
import { Calendar, Play, FileText, Users, Link2, ExternalLink, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const SPEAKING_EVENTS = [
  {
    date: 'Oct 2025',
    title: 'Red Seaweed Extraction Mechanics & Hydrocolloid Physics',
    event: 'Global Hydrocolloids Summit 2025',
    type: 'KEYNOTE',
    desc: 'Presented primary research modeling shear-stress dynamics in plant-based polysaccharide gels. Focused on the mechanical alignment of red seaweed molecular networks under extrusion forces.',
    slides: 'Download PDF (2.8MB)',
    recording: 'Watch Recording (45 mins)'
  },
  {
    date: 'Dec 2025',
    title: 'Clean Label Gelling Systems for B2B Beverage Supply',
    event: 'B2B Food Tech Webinar Series',
    type: 'WEBINAR',
    desc: 'Led a specialized webinar for beverage manufacturing directors outlining stabilizer formulation methods. Demonstrated replacement of modified starches with Kappa Carrageenan/Locus Bean synergies.',
    slides: 'Download Slides',
    recording: 'Access Webinar Portal'
  },
  {
    date: 'Feb 2026',
    title: 'The Future of Solopreneur Operations (Digital Twin ERPs)',
    event: 'Technology & Systems Thinkers Panel',
    type: 'PANEL',
    desc: 'Shared structural blueprint for running B2B engineering consultancies using offline-first database systems and local execution models. Demonstrated the core principles of KGOS.',
    slides: 'View Model Blueprint',
    recording: 'Watch Recording'
  },
  {
    date: 'May 2026',
    title: 'FSSAI Formulation Compliance Auditing Protocols',
    event: 'National Food Safety Regulator Workshop 2026',
    type: 'LECTURE',
    desc: 'Analyzed food additive categorization laws. Provided stabilizer suppliers with a checklist for preparing dossier packages for regulatory submission.',
    slides: 'Compliance Checklist',
    recording: 'Audio Transcript'
  }
];

export default function SpeakingPage() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#2E3A47] pb-24">
      
      {/* ─── Editorial Header ─── */}
      <section className="bg-[#1B2B3B] text-[#F9F8F5] py-24 px-6 md:px-12 relative overflow-hidden border-b border-[#F9F8F5]/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,107,110,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-6 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4892A] font-bold">SPEAKING // PRESENTATIONS</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-widest uppercase leading-none">
            Lectures & Webinars
          </h1>
          <div className="h-[1px] w-20 bg-[#C4892A]/30 mx-auto my-2" />
          <p className="text-sm md:text-base font-mono tracking-widest uppercase text-[#F9F8F5]/70 max-w-2xl mx-auto">
            Review the ledger of past keynotes, B2B food technology webinars, and compliance panel discussions.
          </p>
        </div>
      </section>

      {/* ─── Content Grid ─── */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col gap-12">
        
        <div className="border-b border-[#1B2B3B]/10 pb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#3A6B6E] font-bold">01 / EVENTS LEDGER</span>
          <h2 className="text-2xl font-serif text-[#1B2B3B] font-bold uppercase mt-1">Presentation History</h2>
        </div>

        {/* Ledger Table Layout */}
        <div className="overflow-x-auto border border-[#1B2B3B]/10 rounded-xl shadow-sm bg-[#F9F8F5]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1B2B3B] text-[#F9F8F5] text-[10px] font-mono tracking-widest uppercase border-b border-[#1B2B3B]/10">
                <th className="py-4 px-6 w-24">Date</th>
                <th className="py-4 px-6 w-28">Type</th>
                <th className="py-4 px-6">Presentation Title & Context</th>
                <th className="py-4 px-6 w-56">Resources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2B3B]/10">
              {SPEAKING_EVENTS.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#1B2B3B]/5 transition-colors group">
                  {/* Date Column */}
                  <td className="py-6 px-6 font-mono text-xs font-bold text-[#C4892A]">
                    {item.date}
                  </td>
                  
                  {/* Type Badge Column */}
                  <td className="py-6 px-6">
                    <span className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold tracking-wider ${
                      item.type === 'KEYNOTE' ? 'bg-[#3A6B6E]/15 text-[#3A6B6E]' :
                      item.type === 'WEBINAR' ? 'bg-[#C4892A]/15 text-[#C4892A]' :
                      item.type === 'PANEL' ? 'bg-indigo-900/10 text-indigo-900' :
                      'bg-zinc-800/10 text-zinc-800'
                    }`}>
                      {item.type}
                    </span>
                  </td>

                  {/* Title & Description Column */}
                  <td className="py-6 px-6">
                    <h4 className="text-base font-serif font-bold text-[#1B2B3B] group-hover:text-[#C4892A] transition-colors leading-tight mb-1">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[#2E3A47]/50 block mb-3 uppercase tracking-wider">
                      {item.event}
                    </span>
                    <p className="text-xs text-[#2E3A47]/80 leading-relaxed font-serif max-w-xl">
                      {item.desc}
                    </p>
                  </td>

                  {/* Resources Links Column */}
                  <td className="py-6 px-6 font-mono text-[10px] flex flex-col gap-2">
                    <a href="#" className="flex items-center gap-1.5 text-[#3A6B6E] hover:underline">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{item.slides}</span>
                      <ExternalLink className="w-3 h-3 text-[#3A6B6E]/50" />
                    </a>
                    <a href="#" className="flex items-center gap-1.5 text-[#C4892A] hover:underline">
                      <Play className="w-3.5 h-3.5" />
                      <span>{item.recording}</span>
                      <ExternalLink className="w-3 h-3 text-[#C4892A]/50" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Webinar Booking Banner */}
        <div className="bg-[#1B2B3B]/5 border border-[#1B2B3B]/10 rounded-xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C4892A] font-bold">B2B CONSULTATION</span>
            <h3 className="text-xl font-serif font-bold text-[#1B2B3B] uppercase">Schedule a Private webinar for your team</h3>
            <p className="text-xs text-[#2E3A47]/80 max-w-xl font-serif">
              Book a custom presentation covering hydrocolloid gelation, pilot line scale-up, or food regulation compliance diagnostics.
            </p>
          </div>
          <a
            href="/contact"
            className="group px-5 py-2.5 bg-[#1B2B3B] hover:bg-[#1B2B3B]/90 text-[#F9F8F5] text-xs font-mono font-bold tracking-widest uppercase transition-all rounded flex items-center gap-1.5"
          >
            INQUIRE FORM <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

      </section>

    </div>
  );
}
