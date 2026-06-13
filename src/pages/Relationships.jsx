import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import { RELATIONSHIP_CATEGORIES } from '../utils/constants';
import { Users, Plus, Star, Phone, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function Relationships() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('MENTORS');
  const [org, setOrg] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [strength, setStrength] = useState(3);
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load contacts
  const contacts = useLiveQuery(() => db.relationships.toArray()) || [];

  const handleSaveContact = async (e) => {
    e.preventDefault();
    const contactData = {
      name,
      category,
      organization: org,
      role,
      email,
      phone,
      relationshipStrength: parseInt(strength),
      followUpDate,
      notes
    };

    if (editingContact) {
      await db.relationships.update(editingContact.id, contactData);
    } else {
      await db.relationships.add(contactData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingContact(null);
    setName('');
    setCategory('MENTORS');
    setOrg('');
    setRole('');
    setEmail('');
    setPhone('');
    setStrength(3);
    setFollowUpDate('');
    setNotes('');
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setCategory(contact.category);
    setOrg(contact.organization || '');
    setRole(contact.role || '');
    setEmail(contact.email || '');
    setPhone(contact.phone || '');
    setStrength(contact.relationshipStrength || 3);
    setFollowUpDate(contact.followUpDate || '');
    setNotes(contact.notes || '');
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      await db.relationships.delete(id);
      setIsModalOpen(false);
      resetForm();
    }
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Personal CRM
          </h1>
          <p className="text-sm text-secondary">Manage key industry mentors, food formulation research contacts, and sales stakeholders.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { resetForm(); setIsModalOpen(true); }}>
          Add Connection
        </Button>
      </div>

      {/* Network Category Summary Cards */}
      <div className="grid grid-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {RELATIONSHIP_CATEGORIES.map(cat => {
          const catCount = contacts.filter(c => c.category === cat.key).length;
          return (
            <Card key={cat.key} className="p-4 flex flex-col justify-between" style={{ borderLeft: `3px solid ${cat.color}` }}>
              <span className="text-xs font-semibold text-secondary uppercase block mb-1">{cat.label}</span>
              <span className="text-2xl font-bold font-mono text-primary">{catCount}</span>
            </Card>
          );
        })}
      </div>

      {/* Connections List */}
      <Card header={<span className="card-title">Network Directory</span>}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Company / Org</th>
                <th>Role</th>
                <th>Strength</th>
                <th>Next Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="font-semibold text-primary">{contact.name}</td>
                  <td>
                    <span 
                      className="badge text-xxs font-semibold"
                      style={{ 
                        backgroundColor: `${RELATIONSHIP_CATEGORIES.find(c => c.key === contact.category)?.color}1A`,
                        color: RELATIONSHIP_CATEGORIES.find(c => c.key === contact.category)?.color
                      }}
                    >
                      {contact.category}
                    </span>
                  </td>
                  <td>{contact.organization || '-'}</td>
                  <td>{contact.role || '-'}</td>
                  <td>
                    <div className="flex text-orange-500">
                      {[...Array(contact.relationshipStrength || 3)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </td>
                  <td className="text-xs">{formatDate(contact.followUpDate)}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="p-1 min-w-0" onClick={() => openEditModal(contact)}>
                        <Edit2 className="w-4 h-4 text-muted" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-sm text-secondary p-6">No network connections recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Contact Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingContact ? 'Edit Contact details' : 'Register New Connection'}
      >
        <form onSubmit={handleSaveContact} className="flex flex-col gap-4">
          <FormField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Sanjay Gupta..."
            required
          />
          <div className="grid-2">
            <FormField
              label="Category"
              type="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={RELATIONSHIP_CATEGORIES.map(c => ({ key: c.key, label: c.label }))}
            />
            <FormField
              label="Relationship Strength (1-5)"
              type="select"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              options={[1, 2, 3, 4, 5]}
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Organization"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g. CFTRI or KAFS"
            />
            <FormField
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Lead Technologist"
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sanjay@cftri.res.in"
            />
            <FormField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 99000 12345"
            />
          </div>

          <FormField
            label="Next Scheduled Follow-up"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />

          <FormField
            label="Strategic Context / Notes"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Discuss Carrageenan extraction yield research papers or stabilizer formulation testing..."
          />

          <div className="flex justify-between mt-4">
            {editingContact && (
              <Button variant="danger" onClick={() => handleDeleteContact(editingContact.id)}>
                Delete Contact
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Connection</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
