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
          subtitle: `Horizon: ${g.category}`,
          path: `/life-plan`
        });
      }
    });

    // Search Projects
    const projects = await db.projects.toArray();
    projects.forEach(p => {
      const pTitle = p.title || p.name || '';
      const pObjective = p.objective || p.description || '';
      if (pTitle.toLowerCase().includes(lowerQuery) || pObjective.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'Project',
          id: p.id,
          title: pTitle,
          subtitle: `Category: ${p.category}`,
          path: `/projects`
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
          path: `/tasks`
        });
      }
    });

    // Search B2B Leads
    const leads = await db.leads.toArray();
    leads.forEach(l => {
      const company = l.companyName || l.company || '';
      const contact = l.contactPerson || l.contact || '';
      const stage = l.status || l.stage || '';
      if (company.toLowerCase().includes(lowerQuery) || contact.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'Lead',
          id: l.id,
          title: company,
          subtitle: `Contact: ${contact} | Stage: ${stage}`,
          path: `/business/crm`
        });
      }
    });

    // Search Notes
    const notes = await db.knowledgeNotes.toArray();
    notes.forEach(n => {
      if (n.title.toLowerCase().includes(lowerQuery) || (n.content && n.content.toLowerCase().includes(lowerQuery))) {
        results.push({
          type: 'Note',
          id: n.id,
          title: n.title,
          subtitle: `Category: ${n.category}`,
          path: `/knowledge`
        });
      }
    });

    return results;
  }, [query]) || [];
}
