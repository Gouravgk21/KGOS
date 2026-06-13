import { create } from 'zustand';
import { db } from '../db/database';

export const useCRMStore = create(() => ({
  addLead: async (lead) => {
    return await db.leads.add({
      ...lead,
      stage: lead.stage || 'NEW',
      createdAt: new Date().toISOString()
    });
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
    });
  },
  updateCustomer: async (id, updates) => {
    return await db.customers.update(id, updates);
  },
  addProduct: async (product) => {
    return await db.products.add({
      ...product,
      isActive: product.isActive !== undefined ? product.isActive : true
    });
  },
  updateProduct: async (id, updates) => {
    return await db.products.update(id, updates);
  },
  addSupplier: async (supplier) => {
    return await db.suppliers.add(supplier);
  },
  updateSupplier: async (id, updates) => {
    return await db.suppliers.update(id, updates);
  }
}));
