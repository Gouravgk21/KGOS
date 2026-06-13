import { create } from 'zustand';
import { db, type Lead, type Customer, type Product, type Supplier } from '../db/database';

interface CRMStoreState {
  addLead: (lead: Omit<Lead, 'createdAt'>) => Promise<number>;
  updateLead: (id: number, updates: Partial<Lead>) => Promise<number>;
  updateLeadStage: (id: number, stage: Lead['stage']) => Promise<number>;
  deleteLead: (id: number) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'createdAt'>) => Promise<number>;
  updateCustomer: (id: number, updates: Partial<Customer>) => Promise<number>;
  addProduct: (product: Omit<Product, 'isActive'> & { isActive?: boolean }) => Promise<number>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<number>;
  addSupplier: (supplier: Supplier) => Promise<number>;
  updateSupplier: (id: number, updates: Partial<Supplier>) => Promise<number>;
}

export const useCRMStore = create<CRMStoreState>(() => ({
  addLead: async (lead) => {
    return await db.leads.add({
      ...lead,
      stage: lead.stage || 'NEW',
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateLead: async (id, updates) => {
    return await db.leads.update(id, updates);
  },
  updateLeadStage: async (id, stage) => {
    return await db.leads.update(id, { stage });
  },
  deleteLead: async (id) => {
    return await db.leads.delete(id);
  },
  addCustomer: async (customer) => {
    return await db.customers.add({
      ...customer,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateCustomer: async (id, updates) => {
    return await db.customers.update(id, updates);
  },
  addProduct: async (product) => {
    return await db.products.add({
      ...product,
      isActive: product.isActive !== undefined ? product.isActive : true
    }) as number;
  },
  updateProduct: async (id, updates) => {
    return await db.products.update(id, updates);
  },
  addSupplier: async (supplier) => {
    return await db.suppliers.add(supplier) as number;
  },
  updateSupplier: async (id, updates) => {
    return await db.suppliers.update(id, updates);
  }
}));
