import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import Tabs from '../components/ui/Tabs';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import { Package, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function Products() {
  const [activeTab, setActiveTab] = useState('HYDROCOLLOIDS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('HYDROCOLLOIDS');
  const [description, setDescription] = useState('');
  const [applications, setApplications] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');

  // Load products
  const products = useLiveQuery(
    () => db.products.where('category').equals(activeTab).toArray(),
    [activeTab]
  ) || [];

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await db.products.add({
      name,
      category,
      description,
      applications,
      specifications,
      price: parseFloat(price) || 0,
      unit,
      isActive: true
    });

    setName('');
    setDescription('');
    setApplications('');
    setSpecifications('');
    setPrice('');
    setIsModalOpen(false);
  };

  const handleToggleProduct = async (id, currentStatus) => {
    await db.products.update(id, { isActive: !currentStatus });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product catalog item?')) {
      await db.products.delete(id);
    }
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-accent" />
            Product Catalogue
          </h1>
          <p className="text-sm text-secondary">Manage hydrocolloid stabilizers, carrageenan blends, and agricultural input formulations.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Product
        </Button>
      </div>

      <Card>
        <Tabs
          tabs={PRODUCT_CATEGORIES}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="grid grid-2 gap-6 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {products.map((p) => (
            <div 
              key={p.id} 
              className="p-4 border border-glass rounded-xl flex flex-col justify-between"
              style={{ opacity: p.isActive ? 1 : 0.6 }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-base font-semibold text-primary">{p.name}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleProduct(p.id, p.isActive)}>
                      {p.isActive ? (
                        <ToggleRight className="w-6 h-6 text-success" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-muted" />
                      )}
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)}>
                      <Trash2 className="w-4 h-4 text-muted hover:text-danger" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-secondary mt-1 line-clamp-2">{p.description}</p>
                
                <div className="mt-3">
                  <span className="text-xxs uppercase tracking-wider text-muted font-semibold">Applications</span>
                  <p className="text-xs text-primary mt-0.5">{p.applications || 'General food stabilizer'}</p>
                </div>

                <div className="mt-3">
                  <span className="text-xxs uppercase tracking-wider text-muted font-semibold">Specifications</span>
                  <p className="text-xs text-primary mt-0.5 font-mono">{p.specifications || '-'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-5 pt-3 border-t border-glass">
                <span className="text-xs text-secondary">Formulation Price</span>
                <span className="text-base font-bold font-mono text-success">
                  {formatCurrency(p.price)} <span className="text-xs text-muted font-normal">/ {p.unit}</span>
                </span>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="w-full text-center text-sm text-secondary p-8 col-span-2">
              No products found in this category.
            </div>
          )}
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Catalogue Product">
        <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
          <FormField
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kappa Carrageenan Refined"
            required
          />
          <div className="grid-2">
            <FormField
              label="Category"
              type="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={PRODUCT_CATEGORIES.map(c => ({ key: c.key, label: c.label }))}
            />
            <div className="grid-2 gap-2">
              <FormField
                label="Base Price (INR)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 750"
              />
              <FormField
                label="Unit"
                type="select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={['kg', 'ton', 'liter', 'pack']}
              />
            </div>
          </div>

          <FormField
            label="Product Description"
            type="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce composition, extraction source, and viscosity index..."
          />
          <FormField
            label="Formulation Applications"
            value={applications}
            onChange={(e) => setApplications(e.target.value)}
            placeholder="e.g. Ice cream stabilizer, processed cheese gelling"
          />
          <FormField
            label="Technical Specifications"
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
            placeholder="e.g. Gel strength > 500 g/cm2, pH 8-10"
          />

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Catalogue Item</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
