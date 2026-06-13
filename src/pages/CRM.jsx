import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import Tabs from '../components/ui/Tabs';
import { LEAD_STAGES, INDUSTRIES, PRODUCT_CATEGORIES } from '../utils/constants';
import { UserPlus, Plus, Grid, List } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function CRM() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('pipeline'); // pipeline | list
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('Dairy');
  const [productInterest, setProductInterest] = useState('HYDROCOLLOIDS');
  const [opportunityValue, setOpportunityValue] = useState('');
  const [source, setSource] = useState('Cold Outreach');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [notes, setNotes] = useState('');

  // Live Query B2B Leads
  const leads = useLiveQuery(() => db.leads.toArray()) || [];

  const handleCreateLead = async (e) => {
    e.preventDefault();
    const newLead = {
      company,
      contact,
      email,
      phone,
      industry,
      productInterest,
      stage: 'NEW',
      opportunityValue: parseFloat(opportunityValue) || 0,
      source,
      nextAction,
      nextActionDate,
      notes,
      createdAt: new Date().toISOString()
    };

    await db.leads.add(newLead);
    setIsModalOpen(false);

    // Reset Form Fields
    setCompany('');
    setContact('');
    setEmail('');
    setPhone('');
    setOpportunityValue('');
    setNextAction('');
    setNextActionDate('');
    setNotes('');
  };

  const getStageLeads = (stageKey) => {
    return leads.filter(l => l.stage === stageKey);
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-accent" />
            CRM B2B Lead Pipeline
          </h1>
          <p className="text-sm text-secondary">Formulate custom blends and track B2B negotiations with corporate food processor entities.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Lead
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={activeView === 'pipeline' ? 'primary' : 'secondary'} 
          size="sm" 
          icon={Grid} 
          onClick={() => setActiveView('pipeline')}
        >
          Pipeline Board
        </Button>
        <Button 
          variant={activeView === 'list' ? 'primary' : 'secondary'} 
          size="sm" 
          icon={List} 
          onClick={() => setActiveView('list')}
        >
          List View
        </Button>
      </div>

      {activeView === 'pipeline' ? (
        <div className="pipeline-board">
          {LEAD_STAGES.map((col) => {
            const columnLeads = getStageLeads(col.key);
            return (
              <div className="pipeline-column" key={col.key}>
                <div className="pipeline-column-header">
                  <div className="flex items-center gap-2">
                    <span className="status-dot" style={{ backgroundColor: col.color }} />
                    <span>{col.label}</span>
                  </div>
                  <span className="count">{columnLeads.length}</span>
                </div>
                <div className="pipeline-column-body">
                  {columnLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="pipeline-card"
                      onClick={() => navigate(`/business/crm/${lead.id}`)}
                    >
                      <h4 className="pipeline-card-title text-primary">{lead.company}</h4>
                      <p className="text-xs text-secondary mt-1">{lead.contact} • {lead.industry}</p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-glass">
                        <span className="pipeline-card-value">{formatCurrency(lead.opportunityValue)}</span>
                        <span className="text-xxs badge badge-neutral">{lead.productInterest}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Industry</th>
                  <th>Stage</th>
                  <th>Value</th>
                  <th>Next Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="clickable" onClick={() => navigate(`/business/crm/${l.id}`)}>
                    <td className="font-semibold text-primary">{l.company}</td>
                    <td>{l.contact}</td>
                    <td>{l.industry}</td>
                    <td>
                      <span 
                        className="badge text-xxs font-bold"
                        style={{ 
                          backgroundColor: `${LEAD_STAGES.find(s => s.key === l.stage)?.color}1A`,
                          color: LEAD_STAGES.find(s => s.key === l.stage)?.color
                        }}
                      >
                        {l.stage}
                      </span>
                    </td>
                    <td className="font-mono text-success font-bold">{formatCurrency(l.opportunityValue)}</td>
                    <td className="text-xs">{l.nextAction || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Lead Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register B2B Lead Opportunity">
        <form onSubmit={handleCreateLead} className="flex flex-col gap-4">
          <div className="grid-2">
            <FormField
              label="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Britannia Industries"
              required
            />
            <FormField
              label="Contact Person"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. Dr. Ramesh Kumar"
              required
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. Ramesh@britannia.com"
            />
            <FormField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 99000 12345"
            />
          </div>

          <div className="grid-3">
            <FormField
              label="Industry Sector"
              type="select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={INDUSTRIES}
            />
            <FormField
              label="Product Category Interest"
              type="select"
              value={productInterest}
              onChange={(e) => setProductInterest(e.target.value)}
              options={PRODUCT_CATEGORIES.map(c => ({ key: c.key, label: c.label }))}
            />
            <FormField
              label="Opportunity Value (INR)"
              type="number"
              value={opportunityValue}
              onChange={(e) => setOpportunityValue(e.target.value)}
              placeholder="e.g. 500000"
            />
          </div>

          <div className="grid-3">
            <FormField
              label="Lead Source"
              type="select"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              options={['Cold Outreach', 'Website Inquiry', 'Referral', 'Trade Show', 'LinkedIn Outreach']}
            />
            <FormField
              label="Next Action Description"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="e.g. Send stabilizer blend sample"
            />
            <FormField
              label="Next Action Target Date"
              type="date"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
            />
          </div>

          <FormField
            label="Internal Context & Formulation Notes"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log technical viscosity, mouthfeel requirements or supplier quotes..."
          />

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Opportunity</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
