'use client';

import React, { useState } from 'react';
import { Calendar, Award, BookOpen, FlaskConical, Briefcase, ChevronRight, ArrowRight, MapPin, Compass } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const TIMELINE_EVENTS = [
  {
    year: '2023',
    type: 'RESEARCH',
    title: 'Carrageenan Rheology Analysis',
    location: 'Central Hydrocolloid Research Lab',
    desc: 'Conducted systematic rheological analysis on Kappa/Iota Carrageenan mixtures in dairy models. Modeled viscosity transitions under varying temperature profiles to optimize suspension dynamics.',
    milestone: 'Published primary experiments on structural synergy.'
  },
  {
    year: '2024',
    type: 'RESEARCH',
    title: 'Seaweed Sourcing & Extraction Yields',
    location: 'Cooperative Extraction Plant',
    desc: 'Led a pilot study on red seaweed (Rhodophyta) clean extraction protocols. Reduced heavy metal residues while improving gelling yield by 22% via enzymatically-assisted extraction steps.',
    milestone: 'Authored technical report presented at Hydrocolloids Forum.'
  },
  {
    year: '2025',
    type: 'RESEARCH',
    title: 'Food Systems Macromolecular Modeling',
    location: 'University of Food Technology',
    desc: 'Modeled protein-stabilizer interactions under high shear forces. Developed predictive formulas to avoid syneresis (water separation) in plant-based milk formulations.',
    milestone: 'Completed academic defense with distinction.'
  },
  {
    year: '2026',
    type: 'BUSINESS',
    title: 'Founding of KAFS Food Systems',
    location: 'Bangalore, India',
    desc: 'Established KAFS Food Systems to commercialize clean-label stabilizer blends. Solved particle suspension challenges in B2B chocolate milk, yogurt, and dairy alternatives.',
    milestone: 'Secured first 3 commercial pilot agreements.'
  },
  {
    year: '2028',
    type: 'BUSINESS',
    title: 'Pilot Formulation Lab Launch',
    location: 'KAFS R&D Facility',
    desc: 'Constructed the first automated laboratory scale stabilizer formulation blender. Developed proprietary gel-strength testing algorithms to guarantee uniform batch viscosity.',
    milestone: 'Formulated KAFS Gel-Mix-V4 used by regional dairy majors.'
  },
  {
    year: '2030',
    type: 'BUSINESS',
    title: 'KGOS Platform Orchestration',
    location: 'Digital Command Center',
    desc: 'Designed and deployed the offline-first enterprise orchestration console (KGOS) mapping personal routines, government exam preparation, financial ledger, and sales pipelines.',
    milestone: 'Consolidated research repository, business CRM, and career planning.'
  }
];

export default function AboutPage() {
  const [filter, setFilter] = useState<'ALL' | 'RESEARCH' | 'BUSINESS'>('ALL');
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);

  const filteredEvents = TIMELINE_EVENTS.filter(e => {
    if (filter === 'ALL') return true;
    return e.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#2E3A47] pb-20">
      
      {/* ─── Editorial Header ─── */}
      <section className="bg-[#1B2B3B] text-[#F9F8F5] py-24 px-6 md:px-12 relative overflow-hidden border-b border-[#F9F8F5]/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,107,110,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-6 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4892A] font-bold">BIOGRAPHY // SYSTEM REPLICA</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-widest uppercase leading-tight">
            Kumar Gourav
          </h1>
          <div className="h-[1px] w-20 bg-[#C4892A]/30 mx-auto my-2" />
          <p className="text-sm md:text-base font-mono tracking-widest uppercase text-[#F9F8F5]/70">
            Food Systems Architect · Hydrocolloid Specialist · Systems Thinker
          </p>
        </div>
      </section>

      {/* ─── Editorial Essay (Nature Journal Style) ─── */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="flex flex-col gap-10">
          <div className="border-b border-[#1B2B3B]/10 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3A6B6E] font-bold">01 / NARRATIVE ARCHITECTURE</span>
            <h2 className="text-2xl font-serif text-[#1B2B3B] font-bold uppercase mt-1">Gels, Synergy, and Digital Replicas</h2>
          </div>
          
          <div className="font-serif text-[#2E3A47] text-lg leading-relaxed flex flex-col gap-6">
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-[#C4892A] first-letter:float-left first-letter:mr-3 first-letter:font-bold first-letter:leading-none">
              To build a system is to understand how its interactions determine the macro state. In the study of macromolecular physics, a single polysaccharide chain is chaotic; yet, when Kappa Carrageenan forms a helical complex with milk proteins, it stabilizes suspension across millions of liters of beverage. This emergence of order from localized rules is the foundation of both food science and digital operating systems.
            </p>
            <p>
              Kumar Gourav operates at the intersection of food formulation, seaweed procurement logistics, and software automation. Over the past decade, his research has focused on replacing chemical stabilizers with clean-label plant hydrocolloids. This requires balancing physical shear dynamics in pilot processing lines with volatile market distribution chains.
            </p>
            <p>
              The **KGOS X 2031** architecture is a digital twin representing this exact matrix. It mirrors experimental data, customer pipeline health, time allocations, and long-term milestones. In both formulation and life, predictability is the byproduct of comprehensive tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Interactive Timeline Section ─── */}
      <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto border-t border-[#1B2B3B]/10">
        
        {/* Timeline Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3A6B6E] font-bold block">02 / INTERACTIVE TIMELINE</span>
            <h2 className="text-2xl font-serif text-[#1B2B3B] font-bold uppercase mt-1">Research & Career Ledger</h2>
          </div>
          
          <div className="flex gap-2 bg-[#1B2B3B]/5 p-1 rounded-lg border border-[#1B2B3B]/10">
            {(['ALL', 'RESEARCH', 'BUSINESS'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
                  filter === t 
                    ? 'bg-[#1B2B3B] text-[#F9F8F5] shadow-sm' 
                    : 'text-[#2E3A47]/60 hover:text-[#2E3A47]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Line */}
        <div className="relative border-l border-[#1B2B3B]/15 ml-4 md:ml-32 flex flex-col gap-12 pl-6 md:pl-10">
          
          {filteredEvents.map((evt, idx) => (
            <div key={idx} className="relative group">
              
              {/* Year marker left offset on desktop */}
              <div className="hidden md:block absolute -left-[140px] top-1.5 w-24 text-right">
                <span className="font-mono text-sm font-bold text-[#C4892A] tracking-wider">{evt.year}</span>
                <span className="block text-[9px] font-mono text-[#2E3A47]/40 uppercase mt-0.5">{evt.type}</span>
              </div>

              {/* Node indicator dot */}
              <div className={`absolute -left-[31px] md:-left-[47px] top-2 w-4 h-4 rounded-full border-2 bg-[#F9F8F5] transition-all group-hover:scale-125 ${
                evt.type === 'RESEARCH' ? 'border-[#3A6B6E]' : 'border-[#C4892A]'
              }`} />

              {/* Event card content */}
              <div className="bg-[#F9F8F5] border border-[#1B2B3B]/10 rounded-xl p-6 shadow-sm hover:border-[#1B2B3B]/30 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                  <div>
                    {/* Mobile Year Badge */}
                    <div className="flex items-center gap-2 md:hidden mb-1">
                      <span className="font-mono text-xs font-bold text-[#C4892A]">{evt.year}</span>
                      <span className="h-1 w-1 bg-[#2E3A47]/30 rounded-full" />
                      <span className="text-[8px] font-mono text-[#2E3A47]/50 uppercase">{evt.type}</span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#1B2B3B]">{evt.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#2E3A47]/60 font-mono mt-0.5">
                      {evt.type === 'RESEARCH' ? <FlaskConical className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#2E3A47]/80 leading-relaxed font-serif mb-4">
                  {evt.desc}
                </p>

                <div className="bg-[#1B2B3B]/5 border-l-2 border-[#C4892A] px-3 py-2 rounded-r-md">
                  <span className="text-[9px] font-mono uppercase text-[#C4892A] tracking-wider font-bold block mb-0.5">Key Output</span>
                  <p className="text-xs font-mono text-[#1B2B3B]">{evt.milestone}</p>
                </div>
              </div>

            </div>
          ))}

        </div>
      </section>

    </div>
  );
}
