'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type KnowledgeNode } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Network, Plus, Search, Trash2, Edit, Tag, ZoomIn, ZoomOut, RotateCcw, 
  User, Microscope, Building, BookOpen, GraduationCap, Lightbulb, FileText, Briefcase, Link2
} from 'lucide-react';

const NODE_COLORS = {
  Person: '#3b82f6',       // Blue
  Research: '#a855f7',     // Purple
  Ingredient: '#10b981',   // Green
  Project: '#f97316',      // Orange
  Company: '#14b8a6',      // Teal
  Idea: '#eab308',         // Yellow
  Document: '#6b7280',     // Gray
  Customer: '#ec4899',     // Pink
  Publication: '#6366f1',  // Indigo
  Task: '#ef4444'          // Red
};

interface PhysicsNode {
  id: number;
  title: string;
  type: KnowledgeNode['type'];
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function KnowledgeGraphPage() {
  const nodes = useLiveQuery(() => db.knowledgeNodes.toArray()) || [];
  
  // Left Panel list states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  // Add/Edit node modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeType, setNodeType] = useState<KnowledgeNode['type']>('Idea');
  const [nodeContent, setNodeContent] = useState('');
  const [nodeTags, setNodeTags] = useState('');

  // Physics simulation references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simNodesRef = useRef<PhysicsNode[]>([]);
  const selectedNodeIdRef = useRef<number | null>(null);
  const draggedNodeIdRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  // Pan and Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Auto populate starter nodes
  useEffect(() => {
    const seedNodes = async () => {
      const count = await db.knowledgeNodes.count();
      if (count === 0) {
        const starterNodes = [
          { title: 'Kumar Gourav', type: 'Person' as const, content: 'Founder & Knowledge Architect of KGOS.', tags: 'founder,kgos', linkedIds: '[]', createdAt: new Date().toISOString() },
          { title: 'Carrageenan Research', type: 'Research' as const, content: 'Viscoelastic modeling of kappa/iota structures.', tags: 'carrageenan,hydrocolloids', linkedIds: '[]', createdAt: new Date().toISOString() },
          { title: 'Aqua Colloids', type: 'Company' as const, content: 'Primary B2B manufacturer for stabilizer blends.', tags: 'suppliers,b2b', linkedIds: '[]', createdAt: new Date().toISOString() },
          { title: 'Food Hydrocolloids', type: 'Publication' as const, content: 'Journal covering polysaccharide structures.', tags: 'citations,journal', linkedIds: '[]', createdAt: new Date().toISOString() },
          { title: 'PhD Applications', type: 'Project' as const, content: 'Targeting IIT and NIFTEM food labs.', tags: 'academic,phd', linkedIds: '[]', createdAt: new Date().toISOString() },
          { title: 'FSSAI Exam', type: 'Idea' as const, content: 'Government food safety standards preparation.', tags: 'exams,syllabus', linkedIds: '[]', createdAt: new Date().toISOString() },
          { title: 'LinkedIn Brand', type: 'Idea' as const, content: 'Thought leadership content factory.', tags: 'marketing,linkedIn', linkedIds: '[]', createdAt: new Date().toISOString() },
          { title: 'Health & Energy', type: 'Idea' as const, content: 'Sleep tracking, hydration, and gym velocity logs.', tags: 'health,biohacking', linkedIds: '[]', createdAt: new Date().toISOString() }
        ];
        
        const ids: number[] = [];
        for (const node of starterNodes) {
          const id = await db.knowledgeNodes.add(node);
          ids.push(id as number);
        }
        
        // Connect Kumar Gourav to all others
        const founderId = ids[0];
        const connections = ids.slice(1);
        await db.knowledgeNodes.update(founderId, { linkedIds: JSON.stringify(connections) });
        for (const connId of connections) {
          await db.knowledgeNodes.update(connId, { linkedIds: JSON.stringify([founderId]) });
        }
      }
    };
    seedNodes();
  }, []);

  // Update simulation nodes when database changes
  useEffect(() => {
    if (nodes.length === 0) return;

    // Sync simNodesRef array with DB nodes
    const existingSimNodes = [...simNodesRef.current];
    const newSimNodes = nodes.map(n => {
      const match = existingSimNodes.find(sn => sn.id === n.id);
      if (match) {
        // preserve position/velocity but update title/type
        return {
          ...match,
          title: n.title,
          type: n.type
        };
      } else {
        // create new at random positions around center of canvas
        const width = canvasRef.current?.width || 600;
        const height = canvasRef.current?.height || 400;
        return {
          id: n.id!,
          title: n.title,
          type: n.type,
          x: width / 2 + (Math.random() - 0.5) * 150,
          y: height / 2 + (Math.random() - 0.5) * 150,
          vx: 0,
          vy: 0
        };
      }
    });

    simNodesRef.current = newSimNodes;
  }, [nodes]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const runPhysics = () => {
      const sNodes = simNodesRef.current;
      const dragId = draggedNodeIdRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Parameters for force graph
      const kRepulsion = 1500;
      const kAttraction = 0.04;
      const targetLength = 120;
      const gravity = 0.015;
      const damping = 0.82;

      // 1. Repulsion between all node pairs
      for (let i = 0; i < sNodes.length; i++) {
        const nodeA = sNodes[i];
        for (let j = i + 1; j < sNodes.length; j++) {
          const nodeB = sNodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          
          if (dist < 320) {
            const force = kRepulsion / (dist * dist);
            const ax = force * (dx / dist);
            const ay = force * (dy / dist);

            nodeA.vx -= ax;
            nodeA.vy -= ay;
            nodeB.vx += ax;
            nodeB.vy += ay;
          }
        }
      }

      // 2. Attraction between connected nodes
      for (const node of sNodes) {
        const dbNode = nodes.find(n => n.id === node.id);
        if (!dbNode) continue;

        let linkedIds: number[] = [];
        try {
          linkedIds = JSON.parse(dbNode.linkedIds || '[]');
        } catch {}

        for (const targetId of linkedIds) {
          const nodeB = sNodes.find(sn => sn.id === targetId);
          if (!nodeB) continue;

          const dx = nodeB.x - node.x;
          const dy = nodeB.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

          const force = (dist - targetLength) * kAttraction;
          const ax = force * (dx / dist);
          const ay = force * (dy / dist);

          node.vx += ax;
          node.vy += ay;
          nodeB.vx -= ax;
          nodeB.vy -= ay;
        }
      }

      // 3. Gravity towards center
      for (const node of sNodes) {
        if (node.id === dragId) continue;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * gravity;
        node.vy += dy * gravity;
      }

      // 4. Update position & velocity
      for (const node of sNodes) {
        if (node.id === dragId) continue;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // boundary check
        node.x = Math.max(30, Math.min(width - 30, node.x));
        node.y = Math.max(30, Math.min(height - 30, node.y));
      }
    };

    const drawGraph = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply pan and zoom
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      const sNodes = simNodesRef.current;

      // Draw Edges
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.15)';
      ctx.lineWidth = 1.5;
      for (const node of sNodes) {
        const dbNode = nodes.find(n => n.id === node.id);
        if (!dbNode) continue;
        let linkedIds: number[] = [];
        try { linkedIds = JSON.parse(dbNode.linkedIds || '[]'); } catch {}

        for (const targetId of linkedIds) {
          const targetNode = sNodes.find(sn => sn.id === targetId);
          if (targetNode) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes
      for (const node of sNodes) {
        const isSelected = selectedNodeIdRef.current === node.id;
        const isDragged = draggedNodeIdRef.current === node.id;
        const color = NODE_COLORS[node.type] || '#fff';

        // Outer glow for selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
          ctx.fillStyle = `${color}22`;
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Main circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = isDragged ? '#1a2332' : '#0F172A';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Node label (below)
        ctx.fillStyle = isSelected ? '#F1F5F9' : '#94A3B8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.title, node.x, node.y + 32);

        // Subtext (node type)
        ctx.fillStyle = '#64748B';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillText(node.type.toUpperCase(), node.x, node.y + 42);

        // Dot inside center
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      ctx.restore();
    };

    const tick = () => {
      runPhysics();
      drawGraph();
      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [nodes, zoom, pan]);

  // Handle Resize of Canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = Math.max(450, parent.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Interaction Handlers for Canvas
  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Transform coordinates based on zoom and pan
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    return {
      x: (mouseX - pan.x) / zoom,
      y: (mouseY - pan.y) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasMousePos(e);
    const sNodes = simNodesRef.current;
    
    // Check if clicked a node
    const hitNode = sNodes.find(node => {
      const dx = node.x - pos.x;
      const dy = node.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (hitNode) {
      draggedNodeIdRef.current = hitNode.id;
      selectedNodeIdRef.current = hitNode.id;
      const fullNode = nodes.find(n => n.id === hitNode.id) || null;
      setSelectedNode(fullNode);
    } else {
      // Start panning background
      isPanningRef.current = true;
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const dragId = draggedNodeIdRef.current;
    if (dragId !== null) {
      const pos = getCanvasMousePos(e);
      const node = simNodesRef.current.find(n => n.id === dragId);
      if (node) {
        node.x = pos.x;
        node.y = pos.y;
        node.vx = 0;
        node.vy = 0;
      }
    } else if (isPanningRef.current) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    draggedNodeIdRef.current = null;
    isPanningRef.current = false;
  };

  // Node operations
  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeTitle.trim()) return;

    const data = {
      title: nodeTitle,
      type: nodeType,
      content: nodeContent,
      tags: nodeTags,
      linkedIds: editId !== null ? (nodes.find(n => n.id === editId)?.linkedIds || '[]') : '[]',
      createdAt: new Date().toISOString()
    };

    if (editId !== null) {
      await db.knowledgeNodes.update(editId, data);
      
      // Update active selected node view
      if (selectedNode?.id === editId) {
        setSelectedNode({ ...selectedNode, ...data });
      }
      setEditId(null);
    } else {
      const newId = await db.knowledgeNodes.add(data);
      // Select newly created node
      selectedNodeIdRef.current = newId as number;
      const fullNode = await db.knowledgeNodes.get(newId);
      if (fullNode) setSelectedNode(fullNode);
    }

    setNodeTitle('');
    setNodeType('Idea');
    setNodeContent('');
    setNodeTags('');
    setIsModalOpen(false);
  };

  const handleEdit = (node: KnowledgeNode) => {
    setEditId(node.id!);
    setNodeTitle(node.title);
    setNodeType(node.type);
    setNodeContent(node.content || '');
    setNodeTags(node.tags || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this knowledge node? This will clear its connections as well.')) {
      await db.knowledgeNodes.delete(id);
      
      // Clean up linked connections in other nodes
      const allNodes = await db.knowledgeNodes.toArray();
      for (const node of allNodes) {
        let links: number[] = [];
        try { links = JSON.parse(node.linkedIds || '[]'); } catch {}
        if (links.includes(id)) {
          const updatedLinks = links.filter(l => l !== id);
          await db.knowledgeNodes.update(node.id!, { linkedIds: JSON.stringify(updatedLinks) });
        }
      }

      if (selectedNode?.id === id) {
        setSelectedNode(null);
        selectedNodeIdRef.current = null;
      }
    }
  };

  // Connection Builder
  const [targetConnectId, setTargetConnectId] = useState('');

  const handleAddConnection = async () => {
    if (!selectedNode || !targetConnectId) return;
    const fromId = selectedNode.id!;
    const toId = parseInt(targetConnectId);

    if (fromId === toId) return;

    // Load nodes
    const fromNode = await db.knowledgeNodes.get(fromId);
    const toNode = await db.knowledgeNodes.get(toId);

    if (!fromNode || !toNode) return;

    // Parse links
    let fromLinks: number[] = [];
    let toLinks: number[] = [];
    try { fromLinks = JSON.parse(fromNode.linkedIds || '[]'); } catch {}
    try { toLinks = JSON.parse(toNode.linkedIds || '[]'); } catch {}

    // Add connections bidirectionally
    if (!fromLinks.includes(toId)) fromLinks.push(toId);
    if (!toLinks.includes(fromId)) toLinks.push(fromId);

    await db.knowledgeNodes.update(fromId, { linkedIds: JSON.stringify(fromLinks) });
    await db.knowledgeNodes.update(toId, { linkedIds: JSON.stringify(toLinks) });

    // Refresh active selected view
    const updatedFrom = await db.knowledgeNodes.get(fromId);
    if (updatedFrom) setSelectedNode(updatedFrom);
    
    setTargetConnectId('');
  };

  // Search filter list
  const filteredNodes = nodes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (n.tags && n.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedTypeFilter === 'All' || n.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">Obsidian Brain Synapses</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <Network className="w-8 h-8 text-[#00B4D8]" />
            KNOWLEDGE GRAPH ENGINE
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic force-directed concept graph mapping relationships across research, projects, leads and notes.
          </p>
        </div>

        <button
          onClick={() => { setEditId(null); setIsModalOpen(true); }}
          className="btn-primary text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Node
        </button>
      </div>

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Panel: Search & List (3/10 width) */}
        <div className="lg:col-span-3 flex flex-col gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-850 h-[600px]">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Concept Node Registry</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedTypeFilter}
                onChange={e => setSelectedTypeFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
              >
                <option value="All">All Types</option>
                {Object.keys(NODE_COLORS).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Node Legend */}
          <div className="flex flex-wrap gap-1.5 border-t border-b border-slate-850 py-2.5 my-1">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <span 
                key={type} 
                onClick={() => setSelectedTypeFilter(type)}
                className="text-[8px] font-semibold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-800 cursor-pointer hover:bg-slate-800"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                {type}
              </span>
            ))}
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin">
            {filteredNodes.map(n => {
              const color = NODE_COLORS[n.type] || '#fff';
              const isSelected = selectedNode?.id === n.id;
              
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    setSelectedNode(n);
                    selectedNodeIdRef.current = n.id!;
                    // Focus simulation camera to node
                    const simNode = simNodesRef.current.find(sn => sn.id === n.id);
                    if (simNode && canvasRef.current) {
                      setPan({
                        x: canvasRef.current.width / 2 - simNode.x * zoom,
                        y: canvasRef.current.height / 2 - simNode.y * zoom
                      });
                    }
                  }}
                  className={`p-2.5 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-slate-900 border-[#00B4D8]/30 shadow-md' 
                      : 'bg-[#0B1220]/60 border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold font-serif text-slate-200 block truncate">{n.title}</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">{n.type}</span>
                    </div>
                  </div>
                  <Tag className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                </div>
              );
            })}

            {filteredNodes.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">No nodes match filters.</div>
            )}
          </div>
        </div>

        {/* Center: Graph Canvas (7/10 width) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-850 h-[600px] relative overflow-hidden">
          
          {/* Simulation HUD Toolbar */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              className="p-1.5 bg-[#0B1220] border border-slate-800 rounded hover:bg-slate-800 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1.5 bg-[#0B1220] border border-slate-800 rounded hover:bg-slate-800 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 bg-[#0B1220] border border-slate-800 rounded hover:bg-slate-800 cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Node count stats */}
          <div className="absolute bottom-4 left-4 z-10 text-[10px] font-mono text-slate-500 bg-[#0B1220]/80 px-2 py-1 rounded">
            System Graph: {nodes.length} Nodes | Zoom: {Math.round(zoom * 100)}%
          </div>

          <div className="flex-1 w-full bg-[#0B1220]/60 rounded-xl border border-slate-900 cursor-grab active:cursor-grabbing">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full block"
            />
          </div>
        </div>

        {/* Right Panel: Selection & Connections (2/10 width) */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-850 h-[600px] overflow-y-auto scrollbar-thin">
          
          {selectedNode ? (
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-850 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-serif text-slate-200">{selectedNode.title}</h3>
                  <span 
                    className="inline-block text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-slate-800 mt-1"
                    style={{ borderLeft: `3px solid ${NODE_COLORS[selectedNode.type] || '#fff'}`, color: NODE_COLORS[selectedNode.type] }}
                  >
                    {selectedNode.type}
                  </span>
                </div>
              </div>

              {/* Notes content */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Description / Content</span>
                <p className="bg-[#0B1220]/60 border border-slate-850 p-2.5 rounded-lg text-slate-300 leading-relaxed max-h-[140px] overflow-y-auto scrollbar-thin">
                  {selectedNode.content || 'No details provided.'}
                </p>
              </div>

              {/* Tags */}
              {selectedNode.tags && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.tags.split(',').map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-[#0B1220] border border-slate-850 text-[9px] font-mono text-slate-400">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections list */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Connections</span>
                <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                  {(() => {
                    let links: number[] = [];
                    try { links = JSON.parse(selectedNode.linkedIds || '[]'); } catch {}

                    return links.map(targetId => {
                      const targetNode = nodes.find(n => n.id === targetId);
                      if (!targetNode) return null;

                      return (
                        <div key={targetId} className="flex justify-between items-center bg-[#0B1220] p-1.5 border border-slate-850 rounded text-[11px]">
                          <span className="font-semibold text-slate-300 truncate max-w-[120px]">{targetNode.title}</span>
                          <button
                            onClick={async () => {
                              // Break connection bidirectionally
                              const fromId = selectedNode.id!;
                              const toId = targetNode.id!;
                              
                              let fLinks: number[] = [];
                              let tLinks: number[] = [];
                              try { fLinks = JSON.parse(selectedNode.linkedIds || '[]'); } catch {}
                              try { tLinks = JSON.parse(targetNode.linkedIds || '[]'); } catch {}

                              const updatedF = fLinks.filter(x => x !== toId);
                              const updatedT = tLinks.filter(x => x !== fromId);

                              await db.knowledgeNodes.update(fromId, { linkedIds: JSON.stringify(updatedF) });
                              await db.knowledgeNodes.update(toId, { linkedIds: JSON.stringify(updatedT) });

                              // Refresh active view
                              const refreshed = await db.knowledgeNodes.get(fromId);
                              if (refreshed) setSelectedNode(refreshed);
                            }}
                            className="text-red-400 hover:text-red-300 px-1 font-mono text-[9px]"
                            title="Disconnect"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Add connection form */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-850">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Connect to Node</span>
                <div className="flex gap-2">
                  <select
                    value={targetConnectId}
                    onChange={e => setTargetConnectId(e.target.value)}
                    className="flex-1 py-1 px-2 bg-[#0B1220] border border-slate-800 rounded text-xs text-slate-300 focus:border-slate-700 outline-none"
                  >
                    <option value="">Select node...</option>
                    {nodes
                      .filter(n => n.id !== selectedNode.id)
                      .map(n => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddConnection}
                    className="p-1 bg-[#006D77] hover:bg-[#00B4D8] text-white rounded cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-850">
                <button
                  onClick={() => handleEdit(selectedNode)}
                  className="flex-1 py-1.5 border border-[#00B4D8]/20 bg-[#00B4D8]/5 hover:bg-[#00B4D8]/10 text-[#00B4D8] rounded text-center cursor-pointer font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedNode.id!)}
                  className="flex-1 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded text-center cursor-pointer font-semibold"
                >
                  Delete
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs font-mono">
              <Link2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              Click node on graph or list to inspect details.
            </div>
          )}

        </div>

      </div>

      {/* ADD/EDIT NODE DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">
                {editId !== null ? 'Modify Knowledge Node' : 'Define New Knowledge Node'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveNode} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Title</label>
                <input
                  type="text"
                  value={nodeTitle}
                  onChange={e => setNodeTitle(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  placeholder="e.g. Kappa-2 Carrageenan"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Type</label>
                <select
                  value={nodeType}
                  onChange={e => setNodeType(e.target.value as KnowledgeNode['type'])}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:border-slate-700 outline-none"
                >
                  {Object.keys(NODE_COLORS).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={nodeTags}
                  onChange={e => setNodeTags(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  placeholder="e.g. red-seaweed, stabilizing, gel-physics"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Description / Notes</label>
                <textarea
                  value={nodeContent}
                  onChange={e => setNodeContent(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 h-24 text-xs text-slate-200 focus:border-slate-700 outline-none resize-none leading-relaxed font-mono"
                  placeholder="Summarize key properties, clinical studies or business details..."
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Save Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
