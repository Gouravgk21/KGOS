'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { Network, Plus, Search, Link2 } from 'lucide-react';

interface Node {
  id: number;
  label: string;
  category: string;
  connections: string[];
}

export default function KnowledgePage() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, label: "Carrageenan Viscosity Optimization", category: "Food Technology", connections: ["Heritage Foods Trial", "Iota Blending formulation"] },
    { id: 2, label: "FSSAI Food Additives Regulation (Subpart B)", category: "Compliance", connections: ["Technical Officer Exam Prep", "Stabilizer Blends Pitch"] },
    { id: 3, label: "Semi-Refined Seaweed Blending Ratios", category: "Manufacturing", connections: ["Kappa Carrageenan", "Kwality Confectionery Sample"] }
  ]);

  const [query, setQuery] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState('Compliance');
  const [newConnections, setNewConnections] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel) return;
    const node: Node = {
      id: Date.now(),
      label: newLabel,
      category: newCategory,
      connections: newConnections.split(',').map(s => s.trim()).filter(Boolean)
    };
    setNodes([...nodes, node]);
    setNewLabel('');
    setNewConnections('');
    setIsAddOpen(false);
  };

  const filteredNodes = nodes.filter(n => 
    n.label.toLowerCase().includes(query.toLowerCase()) || 
    n.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Network className="w-6 h-6 text-purple-500" />
            Knowledge Graph
          </h1>
          <p className="text-sm text-zinc-400">Map and connect domain concepts (Formulations, Patents, Compliance, Sales) to active CRM leads and projects.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Node
        </button>
      </div>

      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Define New Concept Node</span>}>
          <form onSubmit={handleAddNode} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Concept Label</label>
                <input 
                  type="text" 
                  value={newLabel} 
                  onChange={e => setNewLabel(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Rheology parameters"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Domain Category</label>
                <select 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                >
                  <option value="Compliance">Compliance & FSSAI</option>
                  <option value="Food Technology">Food Technology</option>
                  <option value="Manufacturing">Manufacturing & Inputs</option>
                  <option value="AI">AI & Systems</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Connected Entities (Comma-separated)</label>
              <input 
                type="text" 
                value={newConnections} 
                onChange={e => setNewConnections(e.target.value)} 
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                placeholder="e.g. Heritage Foods Lead, Gellan Gum Specs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsAddOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white"
              >
                Index Node
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter concepts or category indices..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 outline-none focus:border-zinc-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNodes.map((node) => (
          <Card key={node.id} header={
            <div className="flex justify-between items-center w-full">
              <span className="text-zinc-200 font-semibold">{node.label}</span>
              <span className="text-[9px] font-mono uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
                {node.category}
              </span>
            </div>
          }>
            <div className="flex flex-col gap-3">
              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Linked Assets
              </div>
              <div className="flex flex-wrap gap-2">
                {node.connections.map((conn, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-zinc-950 text-[10px] text-zinc-400 border border-zinc-800">
                    {conn}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
