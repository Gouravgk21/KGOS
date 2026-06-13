import { db } from './database';
import { supabase } from './supabaseClient';

export async function pushToCloud(): Promise<{ success: boolean; error?: string }> {
  console.log('Initiating sync: pushing local updates to Supabase...');

  try {
    // 1. Sync Goals
    const localGoals = await db.goals.toArray();
    for (const goal of localGoals) {
      const { error } = await supabase.from('goals').upsert({
        id: goal.id,
        horizon: goal.horizon,
        category: goal.category,
        status: goal.status,
        title: goal.title,
        description: goal.description,
        target_date: goal.targetDate || null,
        progress: goal.progress,
        created_at: goal.createdAt
      });
      if (error) throw error;
    }

    // 2. Sync Projects
    const localProjects = await db.projects.toArray();
    for (const p of localProjects) {
      const { error } = await supabase.from('projects').upsert({
        id: p.id,
        title: p.title,
        objective: p.objective,
        category: p.category,
        priority: p.priority,
        status: p.status,
        start_date: p.startDate || null,
        end_date: p.endDate || null,
        outcome: p.outcome,
        progress: p.progress,
        created_at: p.createdAt
      });
      if (error) throw error;
    }

    // 3. Sync Tasks
    const localTasks = await db.tasks.toArray();
    for (const t of localTasks) {
      const { error } = await supabase.from('tasks').upsert({
        id: t.id,
        project_id: t.projectId || null,
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: t.status,
        due_date: t.dueDate || null,
        created_at: t.createdAt
      });
      if (error) throw error;
    }

    // 4. Sync CRM Leads
    const localLeads = await db.leads.toArray();
    for (const l of localLeads) {
      const { error } = await supabase.from('leads').upsert({
        id: l.id,
        company: l.company,
        contact: l.contact,
        email: l.email,
        phone: l.phone,
        industry: l.industry,
        product_interest: l.productInterest,
        stage: l.stage,
        opportunity_value: l.opportunityValue,
        source: l.source,
        next_action: l.nextAction,
        next_action_date: l.nextActionDate || null,
        notes: l.notes,
        created_at: l.createdAt
      });
      if (error) throw error;
    }

    // 5. Sync Habits
    const localHabits = await db.habits.toArray();
    for (const h of localHabits) {
      const { error } = await supabase.from('habits').upsert({
        id: h.id,
        name: h.name,
        category: h.category,
        frequency: h.frequency,
        completed_dates: h.completedDates || [],
        streak: h.streak,
        longest_streak: h.longestStreak,
        is_active: h.isActive
      });
      if (error) throw error;
    }

    // 6. Sync Health Logs
    const localHealth = await db.healthLogs.toArray();
    for (const hl of localHealth) {
      const { error } = await supabase.from('health_logs').upsert({
        id: hl.id,
        date: hl.date,
        weight: hl.weight,
        calories: hl.calories,
        protein: hl.protein,
        sleep_hours: hl.sleepHours,
        sleep_quality: hl.sleepQuality,
        energy_level: hl.energyLevel,
        workout_type: hl.workoutType,
        workout_duration: hl.workoutDuration,
        notes: hl.notes
      });
      if (error) throw error;
    }

    // 7. Sync Suppliers
    const localSuppliers = await db.suppliers.toArray();
    for (const s of localSuppliers) {
      const { error } = await supabase.from('suppliers').upsert({
        id: s.id,
        company: s.company,
        contact: s.contact,
        email: s.email,
        phone: s.phone,
        products: s.products,
        moq: s.moq,
        pricing: s.pricing,
        lead_time: s.leadTime,
        quality_rating: s.qualityRating,
        status: s.status,
        notes: s.notes
      });
      if (error) throw error;
    }

    // 8. Sync Connections (Relationships)
    const localRelationships = await db.relationships.toArray();
    for (const r of localRelationships) {
      const { error } = await supabase.from('relationships').upsert({
        id: r.id,
        name: r.name,
        category: r.category,
        organization: r.organization,
        role: r.role,
        email: r.email,
        phone: r.phone,
        relationship_strength: r.relationshipStrength,
        follow_up_date: r.followUpDate || null,
        notes: r.notes
      });
      if (error) throw error;
    }

    console.log('Push Sync Complete!');
    return { success: true };
  } catch (err: any) {
    console.error('Sync failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function pullFromCloud(): Promise<{ success: boolean; error?: string }> {
  console.log('Initiating sync: pulling remote updates from Supabase...');
  try {
    // 1. Sync Goals
    const { data: goals, error: gErr } = await supabase.from('goals').select('*');
    if (gErr) throw gErr;
    if (goals && goals.length > 0) {
      await db.goals.clear();
      await db.goals.bulkAdd(goals.map(g => ({
        id: g.id,
        horizon: g.horizon,
        category: g.category,
        status: g.status,
        title: g.title,
        description: g.description,
        targetDate: g.target_date,
        progress: g.progress,
        createdAt: g.created_at
      })));
    }

    // 2. Sync Projects
    const { data: projects, error: pErr } = await supabase.from('projects').select('*');
    if (pErr) throw pErr;
    if (projects && projects.length > 0) {
      await db.projects.clear();
      await db.projects.bulkAdd(projects.map(p => ({
        id: p.id,
        title: p.title,
        objective: p.objective,
        category: p.category,
        priority: p.priority,
        status: p.status,
        startDate: p.start_date,
        endDate: p.end_date,
        outcome: p.outcome,
        progress: p.progress,
        createdAt: p.created_at
      })));
    }

    // 3. Sync Tasks
    const { data: tasks, error: tErr } = await supabase.from('tasks').select('*');
    if (tErr) throw tErr;
    if (tasks && tasks.length > 0) {
      await db.tasks.clear();
      await db.tasks.bulkAdd(tasks.map(t => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: t.status,
        dueDate: t.due_date,
        createdAt: t.created_at
      })));
    }

    // 4. Sync CRM Leads
    const { data: leads, error: lErr } = await supabase.from('leads').select('*');
    if (lErr) throw lErr;
    if (leads && leads.length > 0) {
      await db.leads.clear();
      await db.leads.bulkAdd(leads.map(l => ({
        id: l.id,
        company: l.company,
        contact: l.contact,
        email: l.email,
        phone: l.phone,
        industry: l.industry,
        productInterest: l.product_interest,
        stage: l.stage,
        opportunityValue: l.opportunity_value,
        source: l.source,
        nextAction: l.next_action,
        nextActionDate: l.next_action_date,
        notes: l.notes,
        createdAt: l.created_at
      })));
    }

    // 5. Sync Habits
    const { data: habits, error: hErr } = await supabase.from('habits').select('*');
    if (hErr) throw hErr;
    if (habits && habits.length > 0) {
      await db.habits.clear();
      await db.habits.bulkAdd(habits.map(h => ({
        id: h.id,
        name: h.name,
        category: h.category,
        frequency: h.frequency,
        completedDates: h.completed_dates,
        streak: h.streak,
        longestStreak: h.longest_streak,
        isActive: h.is_active
      })));
    }

    // 6. Sync Health Logs
    const { data: health, error: hlErr } = await supabase.from('health_logs').select('*');
    if (hlErr) throw hlErr;
    if (health && health.length > 0) {
      await db.healthLogs.clear();
      await db.healthLogs.bulkAdd(health.map(hl => ({
        id: hl.id,
        date: hl.date,
        weight: hl.weight,
        calories: hl.calories,
        protein: hl.protein,
        sleepHours: hl.sleep_hours,
        sleepQuality: hl.sleep_quality,
        energyLevel: hl.energy_level,
        workoutType: hl.workout_type,
        workoutDuration: hl.workout_duration,
        notes: hl.notes
      })));
    }

    // 7. Sync Suppliers
    const { data: suppliers, error: sErr } = await supabase.from('suppliers').select('*');
    if (sErr) throw sErr;
    if (suppliers && suppliers.length > 0) {
      await db.suppliers.clear();
      await db.suppliers.bulkAdd(suppliers.map(s => ({
        id: s.id,
        company: s.company,
        contact: s.contact,
        email: s.email,
        phone: s.phone,
        products: s.products,
        moq: s.moq,
        pricing: s.pricing,
        leadTime: s.lead_time,
        qualityRating: s.quality_rating,
        status: s.status,
        notes: s.notes
      })));
    }

    // 8. Sync Connections
    const { data: relationships, error: rErr } = await supabase.from('relationships').select('*');
    if (rErr) throw rErr;
    if (relationships && relationships.length > 0) {
      await db.relationships.clear();
      await db.relationships.bulkAdd(relationships.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        organization: r.organization,
        role: r.role,
        email: r.email,
        phone: r.phone,
        relationshipStrength: r.relationship_strength,
        followUpDate: r.follow_up_date,
        notes: r.notes
      })));
    }

    console.log('Pull Sync Complete!');
    return { success: true };
  } catch (err: any) {
    console.error('Pull Sync failed:', err.message);
    return { success: false, error: err.message };
  }
}
