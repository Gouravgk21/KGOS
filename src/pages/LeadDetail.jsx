import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import { LEAD_STAGES, INDUSTRIES, PRODUCT_CATEGORIES } from '../utils/constants';
import { ArrowLeft, Edit2, Trash2, Calendar, Target, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit State
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('Dairy');
  const [productInterest, setProductInterest] = useState('CARRAGEENAN');
  const [opportunityValue, setOpportunityValue] = useState('');
  const [stage, setStage] = useState('NEW');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load Single Lead
  const lead = useLiveQuery(() => db.leads.get(parseInt(id)), [id]);

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    await db.leads.update(parseInt(id), {
      company,
      contact,
      email,
      phone,
      industry,
      productInterest,
      stage,
      opportunityValue: parseFloat(opportunityValue) || 0,
      nextAction,
      nextActionDate,
      notes
    });
    setIsModalOpen(false);
  };

  const handleMoveToNextStage = async () => {
    const currentIdx = LEAD_STAGES.findIndex(s => s.key === lead.stage);
    if (currentIdx > -1 && currentIdx < LEAD_STAGES.length - 1) {
      const nextStage = LEAD_STAGES[currentIdx + 1].key;
      await db.leads.update(parseInt(id), { stage: nextStage });
    }
  };

  const handleDeleteLead = async () => {
    if (window.confirm('Delete this B2B lead opportunity?')) {
      await db.leads.delete(parseInt(id));
      navigate('/business/crm');
    }
  };

  if (!lead) {
    return (
      <div className="page animate-fade-in p-6">
        <div className="loading-skeleton loading-bar h-12 w-1/3" />
        <div className="loading-skeleton h-40 mt-6" />
      </div>
    );
  }

  const progressPercentage = (LEAD_STAGES.findIndex(s => s.key === lead.stage) / (LEAD_STAGES.length - 1)) * 100;

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="p-2 min-w-0" onClick={() => navigate('/business/crm')}>
            <ArrowLeft className="w-5 h-5 text-secondary" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">{lead.company}</h1>
            <div className="flex gap-2 mt-1">
              <span 
                className="badge text-xxs font-bold"
                style={{ 
                  backgroundColor: `${LEAD_STAGES.find(s => s.key === lead.stage)?.color}1A`,
                  color: LEAD_STAGES.find(s => s.key === lead.stage)?.color
                }}
              >
                {lead.stage}
              </span>
              <span className="badge badge-neutral">{lead.industry}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            icon={Edit2} 
            onClick={() => {
              setCompany(lead.company);
              setContact(lead.contact);
              setEmail(lead.email || '');
              setPhone(lead.phone || '');
              setIndustry(lead.industry || 'Dairy');
              setProductInterest(lead.productInterest || 'CARRAGEENAN');
              setOpportunityValue(lead.opportunityValue || 0);
              setStage(lead.stage || 'NEW');
              setNextAction(lead.nextAction || '');
              setNextActionDate(lead.nextActionDate || '');
              setNotes(lead.notes || '');
              setIsModalOpen(true);
            }}
          >
            Edit Opportunity
          </Button>
          <Button variant="danger" icon={Trash2} onClick={handleDeleteLead}>
            Delete
          </Button>
        </div>
      </div>

      {/* Stage Progression Bar */}
      <Card header={<span className="card-title">Deal Pipeline Stage Progression</span>}>
        <div className="flex justify-between items-center text-xs text-secondary mb-2 overflow-x-auto gap-2">
          {LEAD_STAGES.map((s, idx) => {
            const isActive = s.key === lead.stage;
            return (
              <span 
                key={s.key} 
                className={`font-semibold pb-1 whitespace-nowrap ${isActive ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
                style={isActive ? { color: 'var(--accent-blue)', borderBottomColor: 'var(--accent-blue)' } : undefined}
              >
                {s.label}
              </span>
            );
          })}
        </div>
        <div className="goal-progress-bar mt-2">
          <div className="goal-progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={handleMoveToNextStage}>
            Advance Pipeline Stage
          </Button>
        </div>
      </Card>

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Contact info and parameters */}
        <Card header={<span className="card-title">Deal & Contact Specifications</span>}>
          <div className="flex flex-col gap-3">
            <div className="stat-row">
              <span className="stat-label">Contact Person</span>
              <span className="stat-value text-primary">{lead.contact}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Email Address</span>
              <span className="stat-value">{lead.email || '-'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Phone Number</span>
              <span className="stat-value">{lead.phone || '-'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Product Interest</span>
              <span className="stat-value text-accent">{lead.productInterest}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Deal Value</span>
              <span className="stat-value text-success font-mono font-bold">{formatCurrency(lead.opportunityValue)}</span>
            </div>
          </div>
        </Card>

        {/* Notes & Actions */}
        <Card header={<span className="card-title">Next Action Details</span>}>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs font-semibold text-secondary uppercase">Next Action</div>
              <p className="text-sm text-primary mt-1 font-semibold">{lead.nextAction || 'No action defined.'}</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-secondary uppercase">Target Date</div>
              <p className="text-sm text-primary mt-1">{formatDate(lead.nextActionDate) || 'No target date.'}</p>
            </div>
            <div className="divider" />
            <div>
              <div className="text-xs font-semibold text-secondary uppercase">Viscosity & Formulation parameters</div>
              <p className="text-xs text-secondary mt-2 leading-relaxed bg-input p-3 rounded-lg border border-glass">
                {lead.notes || 'No formulation notes log added.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Opportunity Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Opportunity parameters">
        <form onSubmit={handleUpdateLead} className="flex flex-col gap-4">
          <FormField
            label="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <FormField
            label="Contact Person"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <div className="grid-2">
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid-3">
            <FormField
              label="Industry"
              type="select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={INDUSTRIES}
            />
            <FormField
              label="Product Interest"
              type="select"
              value={productInterest}
              onChange={(e) => setProductInterest(e.target.value)}
              options={PRODUCT_CATEGORIES.map(c => ({ key: c.key, label: c.label }))}
            />
            <FormField
              label="Stage"
              type="select"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              options={LEAD_STAGES.map(s => ({ key: s.key, label: s.label }))}
            />
          </div>
          <div className="grid-3">
            <FormField
              label="Opportunity Value"
              type="number"
              value={opportunityValue}
              onChange={(e) => setOpportunityValue(e.target.value)}
            />
            <FormField
              label="Next Action"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
            />
            <FormField
              label="Target Date"
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
          />

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Parameters</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
