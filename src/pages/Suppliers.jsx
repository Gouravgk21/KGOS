import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import { Truck, Plus, Star, Edit2, Trash2 } from 'lucide-react';

export default function Suppliers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Form State
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [products, setProducts] = useState('');
  const [moq, setMoq] = useState('');
  const [pricing, setPricing] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [qualityRating, setQualityRating] = useState(4);
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');

  // Load suppliers
  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || [];

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    const supplierData = {
      company,
      contact,
      email,
      phone,
      products,
      moq,
      pricing,
      leadTime,
      qualityRating: parseInt(qualityRating),
      status,
      notes
    };

    if (editingSupplier) {
      await db.suppliers.update(editingSupplier.id, supplierData);
    } else {
      await db.suppliers.add(supplierData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setCompany('');
    setContact('');
    setEmail('');
    setPhone('');
    setProducts('');
    setMoq('');
    setPricing('');
    setLeadTime('');
    setQualityRating(4);
    setStatus('Active');
    setNotes('');
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setCompany(supplier.company);
    setContact(supplier.contact || '');
    setEmail(supplier.email || '');
    setPhone(supplier.phone || '');
    setProducts(supplier.products || '');
    setMoq(supplier.moq || '');
    setPricing(supplier.pricing || '');
    setLeadTime(supplier.leadTime || '');
    setQualityRating(supplier.qualityRating || 4);
    setStatus(supplier.status || 'Active');
    setNotes(supplier.notes || '');
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Remove this supplier from workspace?')) {
      await db.suppliers.delete(id);
      setIsModalOpen(false);
      resetForm();
    }
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-accent" />
            Supplier Network
          </h1>
          <p className="text-sm text-secondary">Manage seaweed suppliers, harvester pools, raw chemical factories, and import specifications.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { resetForm(); setIsModalOpen(true); }}>
          Register Supplier
        </Button>
      </div>

      <Card header={<span className="card-title">Supplier Registry Directory</span>}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Supplied Materials</th>
                <th>MOQ</th>
                <th>Lead Time</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr key={sup.id}>
                  <td className="font-semibold text-primary">{sup.company}</td>
                  <td>{sup.contact || '-'}</td>
                  <td className="max-w-xs truncate">{sup.products}</td>
                  <td className="font-mono text-xs">{sup.moq || '-'}</td>
                  <td>{sup.leadTime || '-'}</td>
                  <td>
                    <div className="flex text-orange-500">
                      {[...Array(sup.qualityRating || 4)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${sup.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                      {sup.status}
                    </span>
                  </td>
                  <td>
                    <Button variant="ghost" className="p-1 min-w-0" onClick={() => openEditModal(sup)}>
                      <Edit2 className="w-4 h-4 text-muted" />
                    </Button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-sm text-secondary p-6">No suppliers cataloged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? 'Modify Supplier Profile' : 'Register Supplier profile'}>
        <form onSubmit={handleSaveSupplier} className="flex flex-col gap-4">
          <FormField
            label="Supplier Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Cochin Seaweed Harvesters Ltd"
            required
          />
          <div className="grid-2">
            <FormField
              label="Contact Person"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. George Mathew"
            />
            <FormField
              label="Supplier Status"
              type="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={['Active', 'Inactive', 'Evaluation']}
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@cochinseaweed.com"
            />
            <FormField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 484 2345678"
            />
          </div>

          <FormField
            label="Supplied Materials / Products"
            value={products}
            onChange={(e) => setProducts(e.target.value)}
            placeholder="e.g. Raw Kappaphycus Alvarezii seaweed, potassium chloride..."
          />

          <div className="grid-3">
            <FormField
              label="Minimum Order Qty (MOQ)"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              placeholder="e.g. 5 Tons"
            />
            <FormField
              label="Pricing reference"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              placeholder="e.g. ₹95/kg CIF"
            />
            <FormField
              label="Average Lead Time"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              placeholder="e.g. 15 days"
            />
          </div>

          <FormField
            label="Quality Rating (1-5)"
            type="select"
            value={qualityRating}
            onChange={(e) => setQualityRating(e.target.value)}
            options={[1, 2, 3, 4, 5]}
          />

          <FormField
            label="Procurement Context & Quality Notes"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log details about dry weight yield ratios, packaging sizes, or regulatory import permits..."
          />

          <div className="flex justify-between mt-4">
            {editingSupplier && (
              <Button variant="danger" onClick={() => handleDeleteSupplier(editingSupplier.id)}>
                Delete Supplier
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Supplier</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
