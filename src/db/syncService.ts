import { db } from './database';
import { syncDexieToCloudAction, pullCloudDataAction } from '@/app/actions/dbSync';

export async function pushToCloud(): Promise<{ success: boolean; error?: string }> {
  console.log('Initiating sync: pushing local updates to PostgreSQL via Server Action...');

  try {
    const tasks = await db.tasks.toArray();
    const goals = await db.goals.toArray();
    const leads = await db.leads.toArray();
    const healthLogs = await db.healthLogs.toArray();
    const researchPapers = await db.researchPapers.toArray();
    const exams = await db.exams.toArray();
    const knowledgeNotes = await db.knowledgeNotes.toArray();
    const documents = await db.documents.toArray();
    const transactions = await db.transactions.toArray();
    const contacts = await db.contacts.toArray();
    const opportunities = await db.opportunities.toArray();
    const timeAllocations = await db.timeAllocations.toArray();
    const products = await db.products.toArray();
    const suppliers = await db.suppliers.toArray();

    const result = await syncDexieToCloudAction({
      tasks,
      goals,
      leads,
      healthLogs,
      researchPapers,
      exams,
      knowledgeNotes,
      documents,
      transactions,
      contacts,
      opportunities,
      timeAllocations,
      products,
      suppliers
    });

    if (!result.success) {
      throw new Error(result.error || 'Server Action failed');
    }

    console.log('Push Sync Complete!');
    return { success: true };
  } catch (err: any) {
    console.error('Push Sync failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function pullFromCloud(): Promise<{ success: boolean; error?: string }> {
  console.log('Initiating sync: pulling remote updates from PostgreSQL via Server Action...');
  try {
    const result = await pullCloudDataAction();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Server Action failed');
    }

    const {
      tasks,
      goals,
      leads,
      healthLogs,
      researchPapers,
      exams,
      knowledgeNotes,
      documents,
      transactions,
      contacts,
      opportunities,
      timeAllocations,
      products,
      suppliers
    } = result.data;

    // Clear and batch re-add local database entries
    await db.transaction('rw', [
      db.tasks, db.goals, db.leads, db.healthLogs, db.researchPapers,
      db.exams, db.knowledgeNotes, db.documents, db.transactions,
      db.contacts, db.opportunities, db.timeAllocations, db.products, db.suppliers
    ], async () => {
      if (tasks && tasks.length > 0) {
        await db.tasks.clear();
        await db.tasks.bulkAdd(tasks);
      }
      if (goals && goals.length > 0) {
        await db.goals.clear();
        await db.goals.bulkAdd(goals);
      }
      if (leads && leads.length > 0) {
        await db.leads.clear();
        await db.leads.bulkAdd(leads);
      }
      if (healthLogs && healthLogs.length > 0) {
        await db.healthLogs.clear();
        await db.healthLogs.bulkAdd(healthLogs);
      }
      if (researchPapers && researchPapers.length > 0) {
        await db.researchPapers.clear();
        await db.researchPapers.bulkAdd(researchPapers);
      }
      if (exams && exams.length > 0) {
        await db.exams.clear();
        await db.exams.bulkAdd(exams);
      }
      if (knowledgeNotes && knowledgeNotes.length > 0) {
        await db.knowledgeNotes.clear();
        await db.knowledgeNotes.bulkAdd(knowledgeNotes);
      }
      if (documents && documents.length > 0) {
        await db.documents.clear();
        await db.documents.bulkAdd(documents);
      }
      if (transactions && transactions.length > 0) {
        await db.transactions.clear();
        await db.transactions.bulkAdd(transactions);
      }
      if (contacts && contacts.length > 0) {
        await db.contacts.clear();
        await db.contacts.bulkAdd(contacts);
      }
      if (opportunities && opportunities.length > 0) {
        await db.opportunities.clear();
        await db.opportunities.bulkAdd(opportunities);
      }
      if (timeAllocations && timeAllocations.length > 0) {
        await db.timeAllocations.clear();
        await db.timeAllocations.bulkAdd(timeAllocations);
      }
      if (products && products.length > 0) {
        await db.products.clear();
        await db.products.bulkAdd(products);
      }
      if (suppliers && suppliers.length > 0) {
        await db.suppliers.clear();
        await db.suppliers.bulkAdd(suppliers);
      }
    });

    console.log('Pull Sync Complete!');
    return { success: true };
  } catch (err: any) {
    console.error('Pull Sync failed:', err.message);
    return { success: false, error: err.message };
  }
}
