'use client';

import React, { useState } from 'react';
import { Mail, Shield, Send, CheckCircle, HelpCircle, Link2, Globe, MapPin, Loader2 } from 'lucide-react';
import { db } from '@/db/database';
import { useAppStore } from '@/store/useAppStore';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    interest: 'Stabilizer Formulation',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    
    // Simulate n8n webhook delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      await db.leads.add({
        companyName: formData.company || 'Independent / Individual',
        contactPerson: formData.name,
        email: formData.email,
        productInterest: formData.interest,
        notes: formData.notes,
        status: 'Lead',
        createdAt: new Date().toISOString()
      });

      useAppStore.getState().addNotification(`New B2B Lead registered: ${formData.name} (${formData.company})`);
      setIsSubmitted(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Failed to log lead:', err);
      alert('Error registering lead in local Database.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#2E3A47] pb-24">
      
      {/* ─── Editorial Header ─── */}
      <section className="bg-[#1B2B3B] text-[#F9F8F5] py-24 px-6 md:px-12 relative overflow-hidden border-b border-[#F9F8F5]/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,107,110,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-6 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4892A] font-bold">CONTACT // RADAR SYSTEM</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-widest uppercase leading-none">
            Inbound Inquiries
          </h1>
          <div className="h-[1px] w-20 bg-[#C4892A]/30 mx-auto my-2" />
          <p className="text-sm md:text-base font-mono tracking-widest uppercase text-[#F9F8F5]/70 max-w-2xl mx-auto">
            Initiate a project inquiry or schedule a systems audit. All leads are registered into the local index.
          </p>
        </div>
      </section>

      {/* ─── Content Grid ─── */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
        
        {/* Left Column: System Status & Info (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="border-b border-[#1B2B3B]/10 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3A6B6E] font-bold">SYSTEM METADATA</span>
            <h2 className="text-2xl font-serif text-[#1B2B3B] font-bold uppercase mt-1">Operational Nodes</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-[#C4892A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono font-bold text-[#1B2B3B] block uppercase tracking-wider">OFFICE ADDRESS</span>
                <span className="text-xs text-[#2E3A47]/80 font-serif">KAFS Enterprise Hub, Bangalore, India</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Link2 className="w-5 h-5 text-[#3A6B6E] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono font-bold text-[#1B2B3B] block uppercase tracking-wider">LINKEDIN NETWORK</span>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-[#3A6B6E] font-mono hover:underline block"
                >
                  linkedin.com/in/kumargourav
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Globe className="w-5 h-5 text-[#C4892A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono font-bold text-[#1B2B3B] block uppercase tracking-wider">SYSTEM STATUS</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  n8n WEBHOOKS ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Secure Audit Notice */}
          <div className="border border-[#1B2B3B]/10 rounded-xl p-6 bg-[#1B2B3B]/5 mt-4">
            <div className="flex items-center gap-2 text-[#3A6B6E] mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Offline Integrity</span>
            </div>
            <p className="text-[11px] text-[#2E3A47]/70 leading-relaxed font-serif">
              KGOS stores all lead details locally in IndexedDB using Dexie.js for privacy. Upon approval, data can be synced to Supabase or forwarded to automated workflows via secure webhooks.
            </p>
          </div>

        </div>

        {/* Right Column: Contact Form (3 cols) */}
        <div className="lg:col-span-3">
          
          <div className="border-b border-[#1B2B3B]/10 pb-4 mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3A6B6E] font-bold">01 / INBOUND FORM</span>
            <h2 className="text-2xl font-serif text-[#1B2B3B] font-bold uppercase mt-1">Submit Project Parameters</h2>
          </div>

          {isSubmitted ? (
            <div className="border border-[#3A6B6E]/30 bg-emerald-50/50 p-8 rounded-xl flex flex-col items-center gap-4 text-center">
              <CheckCircle className="w-12 h-12 text-[#3A6B6E]" />
              <h3 className="text-xl font-serif font-bold text-[#1B2B3B] uppercase">Transmission Successful</h3>
              <p className="text-xs text-[#2E3A47]/80 max-w-sm leading-relaxed font-serif">
                Your B2B inquiry has been logged in the local Dexie.js database. The notification has been registered in the Executive Command Center.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 px-4 py-2 border border-[#1B2B3B]/20 hover:border-[#1B2B3B] text-[#1B2B3B] font-mono text-[10px] tracking-widest uppercase transition-all rounded cursor-pointer"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#2E3A47]/60">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dr. John Doe"
                    className="w-full bg-[#1B2B3B]/5 border border-[#1B2B3B]/10 rounded-lg px-4 py-3 text-xs text-[#2E3A47] outline-none focus:border-[#C4892A] font-serif"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#2E3A47]/60">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. john@company.com"
                    className="w-full bg-[#1B2B3B]/5 border border-[#1B2B3B]/10 rounded-lg px-4 py-3 text-xs text-[#2E3A47] outline-none focus:border-[#C4892A] font-mono"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#2E3A47]/60">Company / Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g. Dairy Corporation"
                  className="w-full bg-[#1B2B3B]/5 border border-[#1B2B3B]/10 rounded-lg px-4 py-3 text-xs text-[#2E3A47] outline-none focus:border-[#C4892A] font-serif"
                />
              </div>

              {/* Interest Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#2E3A47]/60">Primary Subject of Interest</label>
                <select
                  value={formData.interest}
                  onChange={e => setFormData(prev => ({ ...prev, interest: e.target.value }))}
                  className="w-full bg-[#1B2B3B]/5 border border-[#1B2B3B]/10 rounded-lg px-4 py-3 text-xs text-[#2E3A47] outline-none focus:border-[#C4892A] font-mono cursor-pointer"
                >
                  <option value="Stabilizer Formulation">Stabilizer Formulation Consultancy</option>
                  <option value="Seaweed Extraction & Rheology">Seaweed Extraction & Rheology Study</option>
                  <option value="Webinar / Lecture Booking">B2B Webinar / Lecture Booking</option>
                  <option value="Software / Systems Orchestration">Software / Systems Orchestration Audit</option>
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#2E3A47]/60">Project Parameters / Inquiry Details</label>
                <textarea
                  rows={5}
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe viscosity specifications, regulatory boundaries, or system parameters..."
                  className="w-full bg-[#1B2B3B]/5 border border-[#1B2B3B]/10 rounded-lg px-4 py-3 text-xs text-[#2E3A47] outline-none focus:border-[#C4892A] font-serif leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#1B2B3B] hover:bg-[#1B2B3B]/90 disabled:bg-[#1B2B3B]/50 text-[#F9F8F5] text-xs font-mono font-bold tracking-widest uppercase rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C4892A]" />
                    TRANSMITTING TO LOCAL LEDGER...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    SUBMIT TO Command Center
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </section>

    </div>
  );
}
