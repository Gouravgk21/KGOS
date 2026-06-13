import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useGoals(horizon) {
  return useLiveQuery(() => {
    if (horizon) {
      return db.goals.where('horizon').equals(horizon).toArray();
    }
    return db.goals.toArray();
  }, [horizon]);
}

export function useProjects(filters) {
  return useLiveQuery(() => {
    let query = db.projects;
    if (filters) {
      if (filters.status) {
        return query.where('status').equals(filters.status).toArray();
      }
      if (filters.category) {
        return query.where('category').equals(filters.category).toArray();
      }
    }
    return query.toArray();
  }, [filters?.status, filters?.category]);
}

export function useTasks(projectId) {
  return useLiveQuery(() => {
    if (projectId) {
      return db.tasks.where('projectId').equals(parseInt(projectId)).toArray();
    }
    return db.tasks.toArray();
  }, [projectId]);
}

export function useLeads(stage) {
  return useLiveQuery(() => {
    if (stage) {
      return db.leads.where('stage').equals(stage).toArray();
    }
    return db.leads.toArray();
  }, [stage]);
}

export function useCustomers() {
  return useLiveQuery(() => db.customers.toArray());
}

export function useProducts() {
  return useLiveQuery(() => db.products.toArray());
}

export function useSuppliers() {
  return useLiveQuery(() => db.suppliers.toArray());
}

export function useHabits() {
  return useLiveQuery(() => db.habits.toArray());
}

export function useHealthLogs(days = 30) {
  return useLiveQuery(async () => {
    const logs = await db.healthLogs.toArray();
    // Sort logs descending by date and return the first N
    return logs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, days);
  }, [days]);
}

export function useRelationships(category) {
  return useLiveQuery(() => {
    if (category) {
      return db.relationships.where('category').equals(category).toArray();
    }
    return db.relationships.toArray();
  }, [category]);
}

export function useVisionData() {
  return useLiveQuery(() => db.visionData.toArray());
}

export function useSkills() {
  return useLiveQuery(() => db.skills.toArray());
}

export function useJournal(type) {
  return useLiveQuery(() => {
    if (type) {
      return db.journal.where('type').equals(type).toArray();
    }
    return db.journal.toArray();
  }, [type]);
}

export function useNotes(category) {
  return useLiveQuery(() => {
    if (category) {
      return db.notes.where('category').equals(category).toArray();
    }
    return db.notes.toArray();
  }, [category]);
}
