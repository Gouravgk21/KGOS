import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import { SKILL_CATEGORIES } from '../utils/constants';
import { GraduationCap, Plus, Trash2, ArrowUpCircle } from 'lucide-react';

export default function Development() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCat, setSkillCat] = useState('Food Technology');
  const [skillLevel, setSkillLevel] = useState(5);
  const [skillTarget, setSkillTarget] = useState(8);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookStatus, setBookStatus] = useState('Reading');

  const skills = useLiveQuery(() => db.skills.toArray()) || [];
  const notes = useLiveQuery(() => db.notes.toArray()) || [];

  // Filter books (stored as notes with category 'Reading')
  const readingList = notes.filter(n => n.category === 'Reading');

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    await db.skills.add({
      name: skillName,
      category: skillCat,
      level: parseInt(skillLevel),
      targetLevel: parseInt(skillTarget)
    });

    setSkillName('');
    setIsModalOpen(false);
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    await db.notes.add({
      category: 'Reading',
      title: bookTitle,
      content: `${bookAuthor} | Status: ${bookStatus}`,
      tags: ['book'],
      createdAt: new Date().toISOString()
    });

    setBookTitle('');
    setBookAuthor('');
    setIsBookModalOpen(false);
  };

  const incrementSkill = async (id, currentLevel) => {
    if (currentLevel < 10) {
      await db.skills.update(id, { level: currentLevel + 1 });
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm('Delete this skill from tracking?')) {
      await db.skills.delete(id);
    }
  };

  const handleDeleteBook = async (id) => {
    await db.notes.delete(id);
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-accent" />
            Skills & Development
          </h1>
          <p className="text-sm text-secondary">Develop formulation technologies, B2B sales skills, and AI engineering expertise.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Plus} onClick={() => setIsBookModalOpen(true)}>
            Add Book
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Skill
          </Button>
        </div>
      </div>

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Skills Inventory Grid */}
        <Card header={<span className="card-title">Professional Skill Matrix</span>}>
          <div className="flex flex-col gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="p-3 border border-glass rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm font-semibold text-primary block">{skill.name}</span>
                    <span className="text-xxs text-muted">{skill.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-accent">{skill.level}/{skill.targetLevel} Target</span>
                    <Button variant="ghost" className="p-1 min-w-0" onClick={() => incrementSkill(skill.id, skill.level)}>
                      <ArrowUpCircle className="w-4 h-4 text-success" />
                    </Button>
                    <Button variant="ghost" className="p-1 min-w-0" onClick={() => handleDeleteSkill(skill.id)}>
                      <Trash2 className="w-4 h-4 text-muted hover:text-danger" />
                    </Button>
                  </div>
                </div>
                <div className="goal-progress-bar">
                  <div className="goal-progress-fill" style={{ width: `${(skill.level / 10) * 100}%` }} />
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-secondary text-center py-6">No skills currently tracked. Add one above.</p>
            )}
          </div>
        </Card>

        {/* Reading List */}
        <Card header={<span className="card-title">Reading List</span>}>
          <div className="flex flex-col gap-3">
            {readingList.map((book) => {
              const [author, statusPart] = book.content.split(' | ');
              return (
                <div key={book.id} className="flex justify-between items-center p-3 border border-glass rounded-lg">
                  <div>
                    <span className="text-sm font-semibold text-primary block">{book.title}</span>
                    <span className="text-xs text-secondary">{author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge badge-info">{statusPart?.replace('Status: ', '') || 'Unread'}</span>
                    <Button variant="ghost" className="p-1 min-w-0" onClick={() => handleDeleteBook(book.id)}>
                      <Trash2 className="w-4 h-4 text-muted hover:text-danger" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {readingList.length === 0 && (
              <p className="text-sm text-secondary text-center py-6">Reading list is empty.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Add Skill Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Track New Core Skill">
        <form onSubmit={handleCreateSkill} className="flex flex-col gap-4">
          <FormField
            label="Skill Name"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="e.g. Carrageenan Blending Formulations"
            required
          />
          <FormField
            label="Category"
            type="select"
            value={skillCat}
            onChange={(e) => setSkillCat(e.target.value)}
            options={SKILL_CATEGORIES}
          />
          <div className="grid-2">
            <FormField
              label="Current Proficiency (1-10)"
              type="number"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            />
            <FormField
              label="Target Level (1-10)"
              type="number"
              value={skillTarget}
              onChange={(e) => setSkillTarget(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Register Skill</Button>
          </div>
        </form>
      </Modal>

      {/* Add Book Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Add Book to Reading List">
        <form onSubmit={handleCreateBook} className="flex flex-col gap-4">
          <FormField
            label="Book Title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="e.g. Spin Selling or Seaweed Hydrocolloids"
            required
          />
          <FormField
            label="Author"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            placeholder="e.g. Neil Rackham"
          />
          <FormField
            label="Reading Status"
            type="select"
            value={bookStatus}
            onChange={(e) => setBookStatus(e.target.value)}
            options={['To Read', 'Reading', 'Completed']}
          />

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add to List</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
