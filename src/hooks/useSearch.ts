import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export interface SearchResult {
  type: string;
  id?: number;
  title: string;
  subtitle: string;
  path: string;
}

export function useGlobalSearch(query: string): SearchResult[] {
  return useLiveQuery(async () => {
    if (!query || query.trim() === '') return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search Goals
    const goals = await db.goals.toArray();
    goals.forEach(g => {
      if (g.title.toLowerCase().includes(lowerQuery) || (g.description && g.description.toLowerCase().includes(lowerQuery))) {
        results.push({
          type: 'Goal',
          id: g.id,
          title: g.title,
          subtitle: `Horizon: ${g.horizon}`,
          path: `/life-plan`
        });
      }
    });

    // Search Projects
    const projects = await db.projects.toArray();
    projects.forEach(p => {
      if (p.title.toLowerCase().includes(lowerQuery) || (p.objective && p.objective.toLowerCase().includes(lowerQuery))) {
        results.push({
          type: 'Project',
          id: p.id,
          title: p.title,
          subtitle: `Category: ${p.category}`,
          path: `/projects/${p.id}`
        });
      }
    });

    // Search Tasks
    const tasks = await db.tasks.toArray();
    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'Task',
          id: t.id,
          title: t.title,
          subtitle: `Status: ${t.status} | Priority: ${t.priority}`,
          path: `/execution`
        });
      }
    });

    // Search B2B Leads
    const leads = await db.leads.toArray();
    leads.forEach(l => {
      if (l.company.toLowerCase().includes(lowerQuery) || l.contact.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'Lead',
          id: l.id,
          title: l.company,
          subtitle: `Contact: ${l.contact} | Stage: ${l.stage}`,
          path: `/business/crm/${l.id}`
        });
      }
    });

    // Search Notes
    const notes = await db.notes.toArray();
    notes.forEach(n => {
      if (n.title.toLowerCase().includes(lowerQuery) || (n.content && n.content.toLowerCase().includes(lowerQuery))) {
        results.push({
          type: 'Note',
          id: n.id,
          title: n.title,
          subtitle: `Category: ${n.category}`,
          path: `/settings`
        });
      }
    });

    return results;
  }, [query]) || [];
}
