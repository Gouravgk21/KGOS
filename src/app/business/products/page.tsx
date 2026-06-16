'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '@/db/database';
import { useProductStore } from '@/store/useProductStore';
import Card from '@/components/ui/Card';
import { 
  Package, Search, Plus, Trash2, Power, Eye, EyeOff, 
  ChevronLeft, Sparkles, Filter, Droplets, Waves, ChefHat, Sprout, Lightbulb
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { key: 'HYDROCOLLOIDS', label: 'Hydrocolloids', icon: Droplets, color: 'text-blue-400' },
  { key: 'CARRAGEENAN', label: 'Carrageenan', icon: Waves, color: 'text-cyan-400' },
  { key: 'FOOD_INGREDIENTS', label: 'Food Ingredients', icon: ChefHat, color: 'text-amber-400' },
  { key: 'AGRICULTURAL_INPUTS', label: 'Agricultural Inputs', icon: Sprout, color: 'text-emerald-400' },
  { key: 'CONSULTING', label: 'Consulting', icon: Lightbulb, color: 'text-purple-400' }
];

export default function ProductsPage() {
  const products = useLiveQuery(() => db.products.toArray()) ?? [];
  const { addProduct, updateProduct, deleteProduct } = useProductStore();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('HYDROCOLLOIDS');
  const [formActive, setFormActive] = useState(true);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      await addProduct({
        name: formName.trim(),
        category: formCategory,
        isActive: formActive
      });
      setFormName('');
      setIsAddOpen(false);
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await updateProduct(id, { isActive: !currentStatus });
    } catch (err) {
      console.error('Failed to update product state:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <Link href="/business" className="hover:text-zinc-300">KAFS ERP</Link>
            <span>/</span>
            <span className="text-zinc-400">Products</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 mt-1">
            <Package className="w-6 h-6 text-blue-500" /> Formulation Catalog
          </h1>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" /> Add Formulation
        </button>
      </div>

      {/* Add Product Modal Overlay */}
      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">New Product Formulation</span>}>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Formulation Name</label>
              <input
                type="text"
                placeholder="e.g. Kappa ice cream blend KB-22"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Category</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Save Blend
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search formulations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-600"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            All Blends
          </button>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
          <Package className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">No product formulations found</p>
          <p className="text-xs text-zinc-650 mt-1">Try resetting the search filter or add a new recipe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(prod => {
            const cat = CATEGORIES.find(c => c.key === prod.category) || CATEGORIES[0];
            const Icon = cat.icon;
            return (
              <div
                key={prod.id}
                className={`flex flex-col justify-between p-4 rounded-xl border bg-zinc-950/40 transition-all hover:bg-zinc-900/40 ${
                  prod.isActive ? 'border-zinc-850' : 'border-zinc-900 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-450 border border-zinc-800 flex items-center gap-1">
                      <Icon className={`w-3 h-3 ${cat.color}`} />
                      {cat.label}
                    </span>
                    <button
                      onClick={() => handleToggleActive(prod.id!, prod.isActive)}
                      title={prod.isActive ? 'Deactivate formulation' : 'Activate formulation'}
                      className={`p-1.5 rounded-lg border transition-all ${
                        prod.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-400'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200 leading-snug">{prod.name}</h3>
                </div>

                <div className="flex justify-between items-center mt-6 pt-3 border-t border-zinc-900">
                  <span className="text-[10px] text-zinc-600 font-mono">
                    ID: {prod.id} · {new Date(prod.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => handleDelete(prod.id!)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
