'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import {
  Building2, Users, DollarSign, Search, Filter, Plus, Save,
  AlertCircle, ChevronRight, X, FlaskConical, MapPin
} from 'lucide-react';

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  // Queries
  const leads = useLiveQuery(() => db.leads.toArray()) ?? [];
  const contacts = useLiveQuery(() => db.contacts.toArray()) ?? [];
  const formulations = useLiveQuery(() => db.formulations.toArray()) ?? [];

  // Static industries mapping helper
  const COMPANY_INDUSTRIES: Record<string, { industry: string; location: string }> = {
    'Heritage Foods': { industry: 'Dairy', location: 'Hyderabad, India' },
    'Amul Dairy': { industry: 'Dairy', location: 'Anand, India' },
    'Mother Dairy': { industry: 'Dairy', location: 'Noida, India' },
    'Britannia Industries': { industry: 'Bakery', location: 'Bangalore, India' },
    'ITC Limited': { industry: 'Food Processing', location: 'Kolkata, India' },
    'Nestle India': { industry: 'Food Processing', location: 'Gurugram, India' },
    'Parle Agro': { industry: 'Beverages', location: 'Mumbai, India' }
  };

  // Compile unique companies list from leads and contacts
  const companies = useMemo(() => {
    const map: Record<string, any> = {};

    // Gather from leads
    leads.forEach(l => {
      if (!l.companyName) return;
      const name = l.companyName.trim();
      const meta = COMPANY_INDUSTRIES[name] || { industry: 'Food Processing', location: 'India' };

      if (!map[name]) {
        map[name] = {
          name,
          industry: meta.industry,
          location: meta.location,
          leads: [],
          contacts: [],
          pipelineValue: 0
        };
      }
      map[name].leads.push(l);
      map[name].pipelineValue += l.opportunityValue || 0;
    });

    // Gather from contacts
    contacts.forEach(c => {
      if (!c.company) return;
      const name = c.company.trim();
      const meta = COMPANY_INDUSTRIES[name] || { industry: 'Food Processing', location: 'India' };

      if (!map[name]) {
        map[name] = {
          name,
          industry: meta.industry,
          location: meta.location,
          leads: [],
          contacts: [],
          pipelineValue: 0
        };
      }
      // Avoid duplicate contacts
      if (!map[name].contacts.some((x: any) => x.id === c.id)) {
        map[name].contacts.push(c);
      }
    });

    return Object.values(map);
  }, [leads, contacts]);

  // Filter and search
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    });
  }, [companies, searchQuery, industryFilter]);

  // Unique industries for filter list
  const industries = useMemo(() => {
    const set = new Set<string>();
    companies.forEach(c => set.add(c.industry));
    return ['All', ...Array.from(set)];
  }, [companies]);

  // Find linked formulations based on industry
  const getRecommendedFormulation = (industry: string) => {
    if (industry === 'Dairy') {
      return formulations.find(f => f.name.toLowerCase().includes('dairy') || f.name.toLowerCase().includes('milk') || f.name.toLowerCase().includes('kappa')) || formulations[0];
    }
    if (industry === 'Bakery') {
      return formulations.find(f => f.name.toLowerCase().includes('bake') || f.name.toLowerCase().includes('pectin')) || formulations[0];
    }
    return formulations[0];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-display">
            <Building2 className="w-6 h-6 text-[#00B4D8]" /> B2B CLIENT DIRECTORY
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Consolidated profiles aggregated from CRM Pipeline and Network Contacts.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search companies by name or location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-500 uppercase font-mono text-[10px]">Filter Industry:</span>
          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
          >
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Companies Directory Table */}
        <div className="lg:col-span-2">
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Building2 className="w-4 h-4 text-blue-400" /> ACTIVE ENTERPRISE PARTNERS ({filteredCompanies.length})
            </span>
          }>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 font-mono text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-zinc-700" />
                <span>No company matches found.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-850 text-zinc-500 uppercase text-[9px] tracking-wider">
                      <th className="py-2.5 px-3">Company Name</th>
                      <th className="py-2.5 px-3">Industry</th>
                      <th className="py-2.5 px-3">Primary Location</th>
                      <th className="py-2.5 px-3">Contacts</th>
                      <th className="py-2.5 px-3 text-right">Active Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {filteredCompanies.map(c => (
                      <tr
                        key={c.name}
                        onClick={() => setSelectedCompany(c)}
                        className={`hover:bg-zinc-900/40 cursor-pointer transition-colors ${
                          selectedCompany?.name === c.name ? 'bg-zinc-900/60' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-white">{c.name}</td>
                        <td className="py-3 px-3">
                          <span className="bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-[10px] text-zinc-400">
                            {c.industry}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-500">{c.location}</td>
                        <td className="py-3 px-3 text-zinc-400">{c.contacts.length} linked</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">₹{c.pipelineValue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Company Details Card */}
        <div className="lg:col-span-1">
          {selectedCompany ? (
            <Card header={
              <div className="flex justify-between items-center">
                <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
                  <Building2 className="w-4 h-4 text-[#D4A017]" /> COMPANY PROFILE BRIEF
                </span>
                <button onClick={() => setSelectedCompany(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            }>
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide font-display">{selectedCompany.name}</h3>
                  <div className="flex items-center gap-1.5 text-zinc-550 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{selectedCompany.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-850">
                    <span className="text-zinc-600 block uppercase font-bold">Industry Sect</span>
                    <span className="text-zinc-300 font-bold block mt-0.5">{selectedCompany.industry}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-850">
                    <span className="text-zinc-600 block uppercase font-bold">Total Pipeline</span>
                    <span className="text-emerald-400 font-bold block mt-0.5">₹{selectedCompany.pipelineValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Primary Contacts */}
                <div className="space-y-2 border-t border-zinc-850 pt-3">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block font-bold">Linked Network Contacts</span>
                  {selectedCompany.contacts.length === 0 ? (
                    <p className="text-[10px] text-zinc-500 italic font-mono">No network contacts linked to this company yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedCompany.contacts.map((c: any) => (
                        <div key={c.id} className="p-2 rounded bg-zinc-950 border border-zinc-850 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-zinc-300 block">{c.name}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">{c.role}</span>
                          </div>
                          <Link href="/business/crm/contacts" className="text-[#00B4D8] hover:text-white text-[9px] font-mono">Profile</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Linked Leads */}
                <div className="space-y-2 border-t border-zinc-850 pt-3">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block font-bold">Active CRM Leads</span>
                  {selectedCompany.leads.length === 0 ? (
                    <p className="text-[10px] text-zinc-500 italic font-mono">No active pipeline leads.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedCompany.leads.map((l: any) => (
                        <div key={l.id} className="p-2 rounded bg-zinc-950 border border-zinc-850 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-zinc-300 block">{l.productInterest || 'Stabilizer blend'}</span>
                            <span className="text-[9px] text-[#00B4D8] font-mono uppercase font-bold">{l.status}</span>
                          </div>
                          <span className="text-[10px] font-bold font-mono text-emerald-400">₹{(l.opportunityValue || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Science Recommendation */}
                <div className="space-y-2 border-t border-zinc-850 pt-3">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block font-bold">Recommended R&D Stabilizer</span>
                  {getRecommendedFormulation(selectedCompany.industry) ? (
                    <div className="p-2.5 border border-[#00B4D8]/20 bg-[#00B4D8]/5 rounded flex items-center gap-2.5">
                      <FlaskConical className="w-5 h-5 text-[#00B4D8] flex-shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-zinc-200 block">
                          {getRecommendedFormulation(selectedCompany.industry).name}
                        </span>
                        <Link href="/formulation-lab" className="text-[#00B4D8] hover:text-white text-[9px] font-mono mt-0.5 inline-block">
                          Open Formulation Lab
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-550 italic font-mono">No active formulations matching industry requirements.</p>
                  )}
                </div>

              </div>
            </Card>
          ) : (
            <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-650 font-mono flex flex-col items-center gap-2">
              <Building2 className="w-8 h-8 text-zinc-800" />
              <p className="text-xs uppercase tracking-wider">No Company Selected</p>
              <p className="text-[10px] lowercase text-zinc-650">Select a company from the list to view profile details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
