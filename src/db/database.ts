import Dexie, { type Table } from 'dexie';

// ─── EXISTING INTERFACES (v1) ──────────────────────────────────────────────

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'Business' | 'Research' | 'Government Exams' | 'Health' | 'Career' | 'Content' | 'Personal';
  dueDate?: string;
  createdAt: string;
}

export interface Goal {
  id?: number;
  title: string;
  description?: string;
  progress: number;
  dueDate?: string;
  category: '10 Year' | '5 Year' | 'Annual' | 'Quarterly' | 'Monthly';
  horizon?: string;
  createdAt: string;
}

export interface Lead {
  id?: number;
  companyName: string;
  company?: string;
  contactPerson: string;
  contact?: string;
  phone?: string;
  email?: string;
  productInterest?: string;
  status: 'Lead' | 'Contacted' | 'Qualified' | 'Sample Sent' | 'Trial' | 'Proposal' | 'Customer';
  stage?: string;
  notes?: string;
  nextFollowUp?: string;
  opportunityValue?: number;
  industry?: string;
  createdAt: string;
}

export interface HealthLog {
  id?: number;
  date: string;
  weight?: number;
  sleep?: number;
  sleepHours?: number;
  sleepQuality?: number;
  waterIntake?: number;
  exercise?: number;
  energy?: number;
  energyLevel?: number;
  createdAt: string;
}

export interface ResearchPaper {
  id?: number;
  title: string;
  topic: string;
  status: 'Planned' | 'Reading' | 'Summarized' | 'Referenced' | 'In Progress' | 'Completed';
  summary?: string;
  authors?: string;
  journal?: string;
  year?: string;
  doi?: string;
  abstract?: string;
  citations?: number;
  keywords?: string; // comma-separated
  aiSummary?: string;
  bibtexKey?: string;
  citationKey?: string;
  journalImpactFactor?: number;
  quartile?: string;
  readingProgress?: number;
  pdfUrl?: string;
  bibMetadata?: string; // JSON string
  createdAt: string;
  updatedAt?: string;
}

export interface Exam {
  id?: number;
  name: string;
  applicationDate?: string;
  examDate?: string;
  status: string;
  notes?: string;
  studyHours: number;
  targetHours?: number;
  maxMarks?: number;
  createdAt: string;
}

export interface KnowledgeNote {
  id?: number;
  title: string;
  content?: string;
  tags: string[];
  category: 'Notes' | 'Research' | 'Business Knowledge' | 'Ideas' | 'Government Exams' | 'Career';
  createdAt: string;
}

export interface DocumentItem {
  id?: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface DailyReview {
  id?: number;
  date: string;
  energyMorning?: number;
  priorities?: string[];
  wins?: string[];
  challenges?: string[];
  learnings?: string[];
  createdAt: string;
}

export interface Project {
  id?: number;
  title: string;
  name?: string;
  objective?: string;
  description?: string;
  status: 'NOT_STARTED' | 'PLANNING' | 'ACTIVE' | 'WAITING' | 'COMPLETED' | 'ARCHIVED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  progress: number;
  category: string;
  dueDate?: string;
  createdAt: string;
}

export interface Habit {
  id?: number;
  name: string;
  isActive: boolean;
  completedDates: string[];
  createdAt: string;
}

export interface Skill {
  id?: number;
  name: string;
  level: number;
  category: string;
  createdAt: string;
}

export interface Product {
  id?: number;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface Supplier {
  id?: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Transaction {
  id?: number;
  date: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT';
  category: string;
  description: string;
  createdAt: string;
}

export interface Contact {
  id?: number;
  leadId?: number;
  name: string;
  company?: string;
  role: 'Family' | 'Friends' | 'Mentors' | 'Recruiters' | 'Customers' | 'Researchers' | 'Experts' | 'Advisors';
  email?: string;
  phone?: string;
  linkedIn?: string;
  type?: 'Business' | 'Personal';
  relationshipScore?: number;
  interactionCount?: number;
  interactionScore: number; // legacy compat
  lastInteraction?: string;
  lastContact: string; // legacy compat
  notes?: string;
  tags?: string;
  createdAt: string;
}

export interface Opportunity {
  id?: number;
  title: string;
  source: 'Grants' | 'Conferences' | 'Recruiters' | 'Partnerships' | 'Customers' | 'Export';
  roiScore: number;
  revenueImpact: number;
  alignmentScore: number;
  effortScore: number;
  notes?: string;
  createdAt: string;
}

export interface TimeAllocation {
  id?: number;
  date: string;
  category: 'Health' | 'Business' | 'Research' | 'Exams' | 'Career' | 'Relationships' | 'Learning' | 'Brand';
  hoursPlanned: number;
  hoursActual: number;
  createdAt: string;
}

// ─── UPGRADED INTERFACES (v2) ──────────────────────────────────────────────

export interface Formulation {
  id?: number;
  leadId?: number;
  name: string;
  description?: string;
  targetApplication: string;
  processingNotes?: string;
  targetViscosity?: number;
  targetGelStrength?: number;
  status: 'Draft' | 'Active' | 'Archived';
  costPerKg: number;
  ingredientsList: string; // legacy compat
  results?: string; // legacy compat
  version: string; // legacy compat
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id?: number;
  name: string;
  chemicalName?: string;
  description?: string;
  category: string; // 'Hydrocolloid' | 'Emulsifier' | 'Starch' etc.
  type: string;
  costPerKg: number; // legacy compat
  properties?: string; // legacy compat
  suppliers?: string; // legacy compat
  moistureMax?: number;
  ashMax?: number;
  acidInsolubleMatterMax?: number;
  leadPpm?: number;
  arsenicPpm?: number;
  cadmiumPpm?: number;
  mercuryPpm?: number;
  meshSizeSpec?: string;
  phSpecRange?: string;
  viscositySpecRange?: string;
  gelStrengthSpecRange?: string;
  microTvcCfuGMax?: number;
  microYeastMoldCfuGMax?: number;
  microColiformsCfuGMax?: number;
  microSalmonellaNeg?: boolean;
  microEcoliNeg?: boolean;
  regulatoryStatus?: string;
  createdAt: string;
}

export interface FormulationIngredient {
  id?: number;
  formulationId: number;
  ingredientId: number;
  percentage: number;
}

export interface FormulationVersion {
  id?: number;
  formulationId: number;
  version: string;
  recipeJson: string; // JSON string [{ingredientId, pct}]
  processingNotes?: string;
  costPerKg: number;
  updatedAt: string;
  viscosityActual?: number;
  gelStrengthActual?: number;
  phActual?: number;
  solidContentPct?: number;
  activePolymerPct?: number;
  ashContentPct?: number;
  turbidityNtu?: number;
  syneresisPct?: number;
  gellingTempC?: number;
  meltingTempC?: number;
  tpaHardness?: number;
  tpaCohesiveness?: number;
  tpaElasticity?: number;
  tpaSpringiness?: number;
}

export interface SupplierIngredient {
  id?: number;
  supplierId: number;
  ingredientId: number;
  pricePerKg: number;
  leadTimeDays: number;
  purityGrade: string;
  certification?: string;
  createdAt: string;
}

export interface BatchRecord {
  id?: number;
  batchId: string;
  formulationId?: number;
  productName: string;
  targetWeight: number;
  actualWeight?: number;
  yield?: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Failed';
  startDate: string;
  endDate?: string;
  qcPassed?: boolean;
  ambientTempC?: number;
  ambientHumidityPct?: number;
  equipmentId?: string;
  blendingSpeedRpm?: number;
  blendingTimeMins?: number;
  moistureContentPct?: number;
  meshPassPct?: number;
  sieveOversizePct?: number;
  lotNumber?: string;
  bagWeightKg?: number;
  totalBagsProduced?: number;
  rejectionCount?: number;
  deviationNotes?: string;
  notes?: string;
  createdAt: string;
}

export interface BatchIngredientLot {
  id?: number;
  batchRecordId: number;
  ingredientId: number;
  vendorLotNumber: string;
  quantityUsedKg: number;
}

export interface SampleRequest {
  id?: number;
  leadId?: number;
  formulationId?: number;
  clientName: string;
  quantity: string;
  dispatchDate?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Failed';
  applicationCategory: string;
  foodMatrixPh?: number;
  calciumContentPpm?: number;
  processingType?: string;
  targetShelfLifeMths?: number;
  storageTempC?: number;
  shearConditions?: string;
  saltTypePpm?: string;
  fatContentPct?: number;
  proteinContentPct?: number;
  solidsNonFatPct?: number;
  sweetenerTypePct?: string;
  syneresisNoted?: boolean;
  sensoryFeedback?: string; // JSON string
  feedbackRating?: number;
  failureMode?: string;
  trialOutcome?: string;
  nextStepAction?: string;
  createdAt: string;
}

export interface PhdApplication {
  id?: number;
  university: string;
  program: string;
  deadline: string;
  status: 'Researching' | 'Contacted' | 'Applied' | 'Accepted' | 'Rejected';
  qsRanking?: number;
  usNewsRanking?: number;
  greVerbal?: number;
  greQuantitative?: number;
  greAnalytical?: number;
  toeflTotal?: number;
  ieltsScore?: number;
  professorName?: string;
  advisorResearchArea?: string;
  advisorEmail?: string;
  portalUrl?: string;
  applicationFee?: number;
  lorStatus?: string;
  sopStatus: 'Not Started' | 'Drafting' | 'Review' | 'Done';
  scholarship?: string;
  fundingAmount?: number;
  stipendAmtAnnual?: number;
  tuitionWaiverPct?: number;
  sopDraftUrl?: string;
  cvDraftUrl?: string;
  personalStatementUrl?: string;
  transcriptsUploaded: boolean;
  i20Status: 'Not Applicable' | 'Pending' | 'Issued';
  sevisPaid: boolean;
  visaInterviewDate?: string;
  visaStatus: 'Not Applicable' | 'Pending' | 'Approved' | 'Denied';
  notes?: string;
  createdAt: string;
}

export interface AdvisorContact {
  id?: number;
  phdApplicationId: number;
  date: string;
  interactionType: 'Cold Email' | 'Zoom Interview' | 'In Person' | 'Follow Up';
  subject: string;
  contentSummary: string;
  responseReceived: boolean;
  replyDate?: string;
  responseDelayDays?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'No Reply';
  nextStep?: string;
  followUpDueDate?: string;
  correspondenceHistory?: string;
  createdAt: string;
}

export interface StudySession {
  id?: number;
  examId?: number;
  subject: string;
  topic: string;
  durationMinutes: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface StudyTopic {
  id?: number;
  examId?: number;
  name: string;
  subject: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  importance: 1 | 2 | 3;
  syllabusWeightagePct?: number;
  masteryLevel?: number; // 0 to 100, optional for seed/legacy compatibility
  lastRevised?: string;
  nextRevision?: string;
  createdAt: string;
}

export interface Flashcard {
  id?: number;
  studyTopicId: number;
  front: string;
  back: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: string;
  createdAt: string;
}

export interface MockTest {
  id?: number;
  examId?: number;
  title: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  dateTaken: string;
  questions?: string; // JSON string [{q,options,correct,chosen,explanation}]
  errorAnalysis?: string; // JSON string
  createdAt: string;
}

export interface DailyLog {
  id?: number;
  date: string;
  weight?: number;
  sleepHours?: number;
  sleepQuality?: number;
  waterIntakeMl?: number;
  exerciseMins?: number;
  energyLevel?: number;
  moodLevel?: number;
  stressLevel?: number;
  calorieIntakeKcal?: number;
  proteinIntakeG?: number;
  stepsCount?: number;
  heartRateResting?: number;
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  priorities?: string[];
  wins?: string[];
  challenges?: string[];
  learnings?: string[];
  notes?: string;
  createdAt: string;
}

export interface ContentPiece {
  id?: number;
  title: string;
  type: 'LinkedIn' | 'Newsletter' | 'Article' | 'Tweet' | 'Thread';
  status: 'Idea' | 'Draft' | 'Review' | 'Scheduled' | 'Published';
  content?: string;
  tags?: string;
  scheduledDate?: string;
  publishedDate?: string;
  impressions?: number;
  engagements?: number;
  platform?: string;
  createdAt: string;
}

export interface KnowledgeNode {
  id?: number;
  title: string;
  type:
    | 'Person'
    | 'Research'
    | 'Ingredient'
    | 'Project'
    | 'Company'
    | 'Idea'
    | 'Document'
    | 'Customer'
    | 'Publication'
    | 'Task';
  content?: string;
  tags?: string;
  linkedIds: string; // JSON string of number[]
  createdAt: string;
}

export interface AgentMemory {
  id?: number;
  agentId: string;
  agentName: string;
  content: string;
  type: 'fact' | 'context' | 'task' | 'preference';
  relatedId?: number;
  createdAt: string;
}

export interface Notification {
  id?: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface HealthGoal {
  id?: number;
  metric: 'weight' | 'sleep' | 'exercise' | 'water' | 'energy';
  target: number;
  unit: string;
  deadline?: string;
  createdAt: string;
}

export interface BudgetCategory {
  id?: number;
  name: string;
  monthlyLimit: number;
  spent: number;
  month: string;
  createdAt: string;
}

export interface RelationshipContact {
  id?: number;
  name: string;
  role: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  lastInteraction?: string;
  interactionCount: number;
  relationshipScore: number;
  notes?: string;
  tags?: string;
  createdAt: string;
}

export interface AutomationRule {
  id?: number;
  name: string;
  trigger: string;
  conditions: string; // JSON string
  actions: string; // JSON string
  isActive: boolean;
  lastRun?: string;
  runCount: number;
  createdAt: string;
}

// ─── DEXIE CLASS FOR TYPESCRIPT TYPINGS ──────────────────────────────────────

class KGOSDexie extends Dexie {
  // v1 tables
  tasks!: Table<Task>;
  goals!: Table<Goal>;
  leads!: Table<Lead>;
  healthLogs!: Table<HealthLog>;
  researchPapers!: Table<ResearchPaper>;
  exams!: Table<Exam>;
  knowledgeNotes!: Table<KnowledgeNote>;
  documents!: Table<DocumentItem>;
  dailyReviews!: Table<DailyReview>;
  projects!: Table<Project>;
  habits!: Table<Habit>;
  skills!: Table<Skill>;
  products!: Table<Product>;
  suppliers!: Table<Supplier>;
  transactions!: Table<Transaction>;
  contacts!: Table<Contact>;
  opportunities!: Table<Opportunity>;
  timeAllocations!: Table<TimeAllocation>;

  // v2 tables
  formulations!: Table<Formulation>;
  ingredients!: Table<Ingredient>;
  batchRecords!: Table<BatchRecord>;
  studySessions!: Table<StudySession>;
  studyTopics!: Table<StudyTopic>;
  mockTests!: Table<MockTest>;
  contentPieces!: Table<ContentPiece>;
  knowledgeNodes!: Table<KnowledgeNode>;
  agentMemory!: Table<AgentMemory>;
  notifications!: Table<Notification>;
  healthGoals!: Table<HealthGoal>;
  budgetCategories!: Table<BudgetCategory>;
  relationshipContacts!: Table<RelationshipContact>;
  automationRules!: Table<AutomationRule>;

  // Phase 2 new tables
  phdApplications!: Table<PhdApplication>;
  advisorContacts!: Table<AdvisorContact>;
  flashcards!: Table<Flashcard>;
  sampleRequests!: Table<SampleRequest>;
  formulationIngredients!: Table<FormulationIngredient>;
  formulationVersions!: Table<FormulationVersion>;
  supplierIngredients!: Table<SupplierIngredient>;
  batchIngredientLots!: Table<BatchIngredientLot>;
  dailyLogs!: Table<DailyLog>;
}

// ─── PRISMA PROXY ADAPTER ──────────────────────────────────────────────────

import { executePrismaQuery, executePrismaMutation } from '@/app/actions/prismaDb';

// Event emitter callbacks to force live-query updates in client
const changeCallbacks = new Set<() => void>();
export const addChangeCallback = (cb: () => void) => changeCallbacks.add(cb);
export const removeChangeCallback = (cb: () => void) => changeCallbacks.delete(cb);
export const notifyDbChange = () => changeCallbacks.forEach(cb => cb());

class QueryBuilder {
  tableName: string;
  filters: any[] = [];
  sorts: any[] = [];
  limitVal: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  where(field: string) {
    const builder = this;
    return {
      equals(val: any) {
        builder.filters.push({ field, op: 'equals', value: val });
        return builder;
      },
      anyOf(vals: any[]) {
        builder.filters.push({ field, op: 'anyOf', value: vals });
        return builder;
      },
      notEqual(val: any) {
        builder.filters.push({ field, op: 'notEqual', value: val });
        return builder;
      }
    };
  }

  orderBy(field: string) {
    this.sorts.push({ field, direction: 'asc' });
    return this;
  }

  reverse() {
    if (this.sorts.length > 0) {
      this.sorts[this.sorts.length - 1].direction = 'desc';
    } else {
      this.sorts.push({ field: 'id', direction: 'desc' });
    }
    return this;
  }

  limit(n: number) {
    this.limitVal = n;
    return this;
  }

  filter(fn: (item: any) => boolean) {
    this.filters.push({ op: 'filter', fn });
    return this;
  }

  async toArray() {
    return executePrismaQuery(this.tableName, this.filters, this.sorts, this.limitVal);
  }

  async count() {
    const results = await this.toArray();
    return results.length;
  }
}

class TableMock {
  tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  where(field: string) {
    return new QueryBuilder(this.tableName).where(field);
  }

  filter(fn: any) {
    return new QueryBuilder(this.tableName).filter(fn);
  }

  orderBy(field: string) {
    return new QueryBuilder(this.tableName).orderBy(field);
  }

  async toArray() {
    return executePrismaQuery(this.tableName, [], [], null);
  }

  async count() {
    const results = await this.toArray();
    return results.length;
  }

  async add(item: any) {
    const res = await executePrismaMutation(this.tableName, 'add', { item });
    notifyDbChange();
    return res;
  }

  async put(item: any) {
    const res = await executePrismaMutation(this.tableName, 'put', { item });
    notifyDbChange();
    return res;
  }

  async update(id: any, changes: any) {
    const res = await executePrismaMutation(this.tableName, 'update', { id, changes });
    notifyDbChange();
    return res;
  }

  async delete(id: any) {
    const res = await executePrismaMutation(this.tableName, 'delete', { id });
    notifyDbChange();
    return res;
  }

  async clear() {
    const res = await executePrismaMutation(this.tableName, 'clear', {});
    notifyDbChange();
    return res;
  }

  async bulkAdd(items: any[]) {
    const res = await executePrismaMutation(this.tableName, 'bulkAdd', { items });
    notifyDbChange();
    return res;
  }
}

const TABLE_NAMES = [
  'tasks', 'goals', 'leads', 'healthLogs', 'researchPapers', 'exams',
  'knowledgeNotes', 'documents', 'dailyReviews', 'projects', 'habits',
  'skills', 'products', 'suppliers', 'transactions', 'contacts',
  'opportunities', 'timeAllocations', 'formulations', 'ingredients',
  'batchRecords', 'studySessions', 'studyTopics', 'mockTests', 'contentPieces',
  'knowledgeNodes', 'agentMemory', 'notifications', 'healthGoals',
  'budgetCategories', 'relationshipContacts', 'automationRules',
  'phdApplications', 'advisorContacts', 'flashcards', 'sampleRequests',
  'formulationIngredients', 'formulationVersions', 'supplierIngredients',
  'batchIngredientLots', 'dailyLogs'
];

export const db = new Proxy({
  tables: TABLE_NAMES.map(name => new TableMock(name)),
  transaction(mode: string, tables: any[], cb: () => any) {
    return cb();
  }
} as any, {
  get(target, prop) {
    if (prop === 'tables') return target.tables;
    if (prop === 'transaction') return target.transaction;
    if (typeof prop === 'string') {
      return new TableMock(prop);
    }
    return undefined;
  }
}) as unknown as KGOSDexie;
