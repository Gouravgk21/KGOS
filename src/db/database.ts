import Dexie, { type Table } from 'dexie';

export interface Goal {
  id?: number;
  horizon: 'DAILY' | 'QUARTERLY' | 'ANNUAL' | 'THREE_YEAR' | 'FIVE_YEAR' | 'DECADE';
  category: 'BUSINESS' | 'HEALTH' | 'WEALTH' | 'RESEARCH' | 'EXAMS' | 'CAREER' | 'RELATIONSHIPS' | 'BRAND';
  status: string;
  title: string;
  description: string;
  targetDate?: string;
  progress: number;
  createdAt: string;
  parentId?: number;
  projectId?: number;
}

export interface Project {
  id?: number;
  title: string;
  objective?: string;
  category: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  outcome?: string;
  progress: number;
  createdAt: string;
}

export interface Task {
  id?: number;
  projectId?: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

export interface HealthLog {
  id?: number;
  date: string;
  weight?: number;
  calories?: number;
  protein?: number;
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  workoutType?: string;
  workoutDuration?: number;
  notes?: string;
}

export interface Habit {
  id?: number;
  name: string;
  category: string;
  frequency: string;
  completedDates: string[];
  streak: number;
  longestStreak: number;
  isActive: boolean;
}

export interface Lead {
  id?: number;
  company: string;
  contact: string;
  email?: string;
  phone?: string;
  industry?: string;
  productInterest?: string;
  stage: 'LEAD' | 'CONTACTED' | 'QUALIFIED' | 'SAMPLE_SENT' | 'TRIAL' | 'PROPOSAL' | 'CUSTOMER' | 'REPEAT_CUSTOMER';
  opportunityValue: number;
  source?: string;
  nextAction?: string;
  nextActionDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id?: number;
  company: string;
  contact: string;
  email?: string;
  status: string;
  createdAt: string;
}

export interface Product {
  id?: number;
  name: string;
  category: string;
  description?: string;
  applications?: string;
  specifications?: string;
  price?: number;
  unit?: string;
  isActive: boolean;
}

export interface Supplier {
  id?: number;
  company: string;
  contact: string;
  email?: string;
  phone?: string;
  products?: string;
  moq?: string;
  pricing?: string;
  leadTime?: string;
  qualityRating?: number;
  status: string;
  notes?: string;
}

export interface Relationship {
  id?: number;
  name: string;
  category: string;
  organization?: string;
  role?: string;
  email?: string;
  phone?: string;
  relationshipStrength?: number;
  followUpDate?: string;
  notes?: string;
}

export interface JournalEntry {
  id?: number;
  date: string;
  type: string;
  content: string;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export interface Skill {
  id?: number;
  name: string;
  category: string;
  level: number;
  targetLevel: number;
}

export interface VisionData {
  id?: number;
  key: string;
  value: any;
}

class KGOSDexie extends Dexie {
  goals!: Table<Goal>;
  projects!: Table<Project>;
  tasks!: Table<Task>;
  healthLogs!: Table<HealthLog>;
  habits!: Table<Habit>;
  leads!: Table<Lead>;
  customers!: Table<Customer>;
  products!: Table<Product>;
  suppliers!: Table<Supplier>;
  relationships!: Table<Relationship>;
  journal!: Table<JournalEntry>;
  notes!: Table<Note>;
  skills!: Table<Skill>;
  visionData!: Table<VisionData>;

  constructor() {
    super('KGOS2031_Ultimate');
    this.version(1).stores({
      goals: '++id, horizon, category, status, parentId, projectId, createdAt',
      projects: '++id, category, status, priority, createdAt',
      tasks: '++id, projectId, status, priority, category, dueDate, createdAt',
      healthLogs: '++id, date',
      habits: '++id, category, isActive',
      leads: '++id, stage, industry, createdAt',
      customers: '++id, status, createdAt',
      products: '++id, category, isActive',
      suppliers: '++id, status',
      relationships: '++id, category',
      journal: '++id, date, type',
      notes: '++id, category, *tags',
      skills: '++id, category',
      visionData: '++id, key'
    });
  }
}

export const db = new KGOSDexie();
