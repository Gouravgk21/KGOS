'use server';

import { prisma } from '@/db/prisma';
import { getOrCreateProfile } from './helper';

// Maps frontend camelCase tables to Prisma client methods
function getModel(tableName: string): any {
  const mapping: Record<string, string> = {
    tasks: 'task',
    goals: 'goal',
    leads: 'lead',
    healthLogs: 'dailyLog', // Consolidate healthLogs to dailyLog
    dailyReviews: 'dailyLog', // Consolidate dailyReviews to dailyLog
    researchPapers: 'researchPaper',
    exams: 'exam',
    knowledgeNotes: 'knowledgeNote',
    documents: 'document',
    transactions: 'transaction',
    contacts: 'contact',
    opportunities: 'opportunity',
    timeAllocations: 'timeAllocation',
    products: 'product',
    suppliers: 'supplier',
    formulations: 'formulation',
    ingredients: 'ingredient',
    batchRecords: 'batchRecord',
    studySessions: 'studySession',
    studyTopics: 'studyTopic',
    mockTests: 'mockTest',
    contentPieces: 'contentPiece',
    knowledgeNodes: 'knowledgeNode',
    agentMemory: 'agentMemory',
    notifications: 'notification',
    healthGoals: 'healthGoal',
    budgetCategories: 'budgetCategory',
    relationshipContacts: 'contact', // Unified relationshipContacts to contact
    automationRules: 'automationRule',
    phdApplications: 'phdApplication',
    advisorContacts: 'advisorContact',
    flashcards: 'flashcard',
    sampleRequests: 'sampleRequest',
    formulationIngredients: 'formulationIngredient',
    formulationVersions: 'formulationVersion',
    supplierIngredients: 'supplierIngredient',
    batchIngredientLots: 'batchIngredientLot',
    dailyLogs: 'dailyLog'
  };

  const modelKey = mapping[tableName];
  if (!modelKey) throw new Error(`Unknown table mapping: ${tableName}`);
  
  const model = (prisma as any)[modelKey];
  if (!model) throw new Error(`Prisma model not found: ${modelKey}`);
  return model;
}

// Helper to parse dates securely
function toDate(val: any): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// Helper to format payload data for Prisma models (handling dates, relations, BigInts)
function formatDataForPrisma(tableName: string, data: any, userId: string) {
  const result: any = { ...data, userId };

  // Remove Dexie specific fields if any
  delete result.id;

  // Type coercions / formatting for specific models
  if (tableName === 'tasks') {
    result.dueDate = toDate(result.dueDate);
  } else if (tableName === 'goals') {
    result.dueDate = toDate(result.dueDate);
  } else if (tableName === 'leads') {
    result.nextFollowUp = toDate(result.nextFollowUp);
  } else if (tableName === 'healthLogs') {
    // Map legacy HealthLog to DailyLog schema
    result.date = toDate(result.date) || new Date();
    result.sleepHours = result.sleep !== undefined ? result.sleep : result.sleepHours;
    result.sleepQuality = result.sleepQuality;
    result.waterIntakeMl = result.waterIntake !== undefined ? Math.round(result.waterIntake * 250) : result.waterIntakeMl;
    result.exerciseMins = result.exercise !== undefined ? result.exercise : result.exerciseMins;
    result.energyLevel = result.energy !== undefined ? result.energy : result.energyLevel;
    
    // Delete legacy parameters
    delete result.sleep;
    delete result.waterIntake;
    delete result.exercise;
    delete result.energy;
    delete result.energyLevelLegacy;
  } else if (tableName === 'dailyReviews') {
    // Map legacy DailyReview to DailyLog schema
    result.date = toDate(result.date) || new Date();
    result.energyLevel = result.energyMorning !== undefined ? result.energyMorning : result.energyLevel;
    result.priorities = result.priorities || [];
    result.wins = result.wins || [];
    result.challenges = result.challenges || [];
    result.learnings = result.learnings || [];
    
    delete result.energyMorning;
  } else if (tableName === 'dailyLogs') {
    result.date = toDate(result.date) || new Date();
  } else if (tableName === 'researchPapers') {
    result.createdAt = toDate(result.createdAt) || new Date();
    result.updatedAt = toDate(result.updatedAt) || new Date();
  } else if (tableName === 'exams') {
    result.applicationDate = toDate(result.applicationDate);
    result.examDate = toDate(result.examDate);
  } else if (tableName === 'transactions') {
    result.date = toDate(result.date) || new Date();
  } else if (tableName === 'contacts' || tableName === 'relationshipContacts') {
    result.lastInteraction = toDate(result.lastInteraction || result.lastContact);
    delete result.lastContact;
  } else if (tableName === 'timeAllocations') {
    result.date = toDate(result.date) || new Date();
  } else if (tableName === 'batchRecords') {
    result.startDate = toDate(result.startDate) || new Date();
    result.endDate = toDate(result.endDate);
  } else if (tableName === 'studySessions') {
    result.date = toDate(result.date) || new Date();
  } else if (tableName === 'studyTopics') {
    result.lastRevised = toDate(result.lastRevised);
    result.nextRevision = toDate(result.nextRevision);
  } else if (tableName === 'mockTests') {
    result.dateTaken = toDate(result.dateTaken) || new Date();
  } else if (tableName === 'contentPieces') {
    result.scheduledDate = toDate(result.scheduledDate);
    result.publishedDate = toDate(result.publishedDate);
  } else if (tableName === 'automationRules') {
    result.lastRun = toDate(result.lastRun);
  } else if (tableName === 'phdApplications') {
    result.deadline = toDate(result.deadline) || new Date();
    result.visaInterviewDate = toDate(result.visaInterviewDate);
  } else if (tableName === 'advisorContacts') {
    result.date = toDate(result.date) || new Date();
    result.replyDate = toDate(result.replyDate);
    result.followUpDueDate = toDate(result.followUpDueDate);
  } else if (tableName === 'flashcards') {
    result.nextReview = toDate(result.nextReview) || new Date();
  } else if (tableName === 'sampleRequests') {
    result.dispatchDate = toDate(result.dispatchDate);
  } else if (tableName === 'formulationVersions') {
    result.updatedAt = toDate(result.updatedAt) || new Date();
  }

  // Handle optional BigInt relation mappings (convert number to BigInt)
  if (result.projectId !== undefined && result.projectId !== null) result.projectId = BigInt(result.projectId);
  if (result.formulationId !== undefined && result.formulationId !== null) result.formulationId = BigInt(result.formulationId);
  if (result.examId !== undefined && result.examId !== null) result.examId = BigInt(result.examId);
  if (result.documentId !== undefined && result.documentId !== null) result.documentId = BigInt(result.documentId);
  if (result.relatedId !== undefined && result.relatedId !== null) result.relatedId = BigInt(result.relatedId);
  if (result.leadId !== undefined && result.leadId !== null) result.leadId = BigInt(result.leadId);
  if (result.phdApplicationId !== undefined && result.phdApplicationId !== null) result.phdApplicationId = BigInt(result.phdApplicationId);
  if (result.studyTopicId !== undefined && result.studyTopicId !== null) result.studyTopicId = BigInt(result.studyTopicId);
  if (result.batchRecordId !== undefined && result.batchRecordId !== null) result.batchRecordId = BigInt(result.batchRecordId);
  if (result.ingredientId !== undefined && result.ingredientId !== null) result.ingredientId = BigInt(result.ingredientId);
  if (result.supplierId !== undefined && result.supplierId !== null) result.supplierId = BigInt(result.supplierId);

  return result;
}

export async function executePrismaQuery(tableName: string, filters: any[], sorts: any[], limitVal: number | null) {
  try {
    const profile = await getOrCreateProfile();
    const userId = profile.id;
    const model = getModel(tableName);

    const queryArgs: any = {
      where: { userId }
    };

    // Apply Dexie filters as Prisma where conditions
    for (const f of filters) {
      if (f.op === 'equals') {
        let val = f.value;
        if (f.field === 'id') val = BigInt(val);
        queryArgs.where[f.field] = val;
      } else if (f.op === 'anyOf') {
        let vals = f.value;
        if (f.field === 'id') vals = vals.map((v: any) => BigInt(v));
        queryArgs.where[f.field] = { in: vals };
      } else if (f.op === 'notEqual') {
        let val = f.value;
        if (f.field === 'id') val = BigInt(val);
        queryArgs.where[f.field] = { not: val };
      }
    }

    // Apply sorting
    if (sorts && sorts.length > 0) {
      queryArgs.orderBy = sorts.map((s: any) => ({
        [s.field]: s.direction
      }));
    }

    // Apply limits
    if (limitVal !== null && limitVal !== undefined) {
      queryArgs.take = limitVal;
    }

    const items = await model.findMany(queryArgs);

    // Run client side filters (js functions) if applicable
    let result = items;
    for (const f of filters) {
      if (f.op === 'filter' && typeof f.fn === 'function') {
        result = result.filter(f.fn);
      }
    }

    // Map consolidated fields back for legacy client components
    if (tableName === 'healthLogs') {
      result = result.map((item: any) => {
        const mapped = { ...item };
        mapped.sleep = item.sleepHours;
        mapped.sleepHours = item.sleepHours;
        mapped.sleepQuality = item.sleepQuality;
        mapped.waterIntake = item.waterIntakeMl ? Number((item.waterIntakeMl / 250).toFixed(1)) : undefined;
        mapped.exercise = item.exerciseMins;
        mapped.energy = item.energyLevel;
        mapped.energyLevel = item.energyLevel;
        return mapped;
      });
    } else if (tableName === 'dailyReviews') {
      result = result.map((item: any) => {
        const mapped = { ...item };
        mapped.energyMorning = item.energyLevel;
        return mapped;
      });
    }

    // Serialize BigInt and Decimal properties to numbers for JS client-side safety
    return JSON.parse(JSON.stringify(result, (key, value) => {
      if (typeof value === 'bigint') return Number(value);
      return value;
    }));
  } catch (err: any) {
    console.error(`Error querying table ${tableName}:`, err);
    return [];
  }
}

export async function executePrismaMutation(tableName: string, action: string, payload: any) {
  try {
    const profile = await getOrCreateProfile();
    const userId = profile.id;
    const model = getModel(tableName);

    if (action === 'add') {
      const data = formatDataForPrisma(tableName, payload.item, userId);
      const res = await model.create({ data });
      return Number(res.id);
    }

    if (action === 'put') {
      const { item } = payload;
      const { id } = item;
      const data = formatDataForPrisma(tableName, item, userId);

      let res;
      if (id) {
        res = await model.upsert({
          where: { id: BigInt(id) },
          update: data,
          create: { id: BigInt(id), ...data }
        });
      } else {
        res = await model.create({ data });
      }
      return Number(res.id);
    }

    if (action === 'update') {
      const { id, changes } = payload;
      const changesFormatted = formatDataForPrisma(tableName, changes, userId);
      
      const res = await model.update({
        where: { id: BigInt(id) },
        data: changesFormatted
      });
      return Number(res.id);
    }

    if (action === 'delete') {
      const { id } = payload;
      await model.delete({
        where: { id: BigInt(id) }
      });
      return true;
    }

    if (action === 'clear') {
      await model.deleteMany({
        where: { userId }
      });
      return true;
    }

    if (action === 'bulkAdd') {
      const { items } = payload;
      const dataList = items.map((item: any) => formatDataForPrisma(tableName, item, userId));
      await model.createMany({
        data: dataList
      });
      return true;
    }

    throw new Error(`Unsupported mutation: ${action}`);
  } catch (err: any) {
    console.error(`Error performing mutation ${action} on table ${tableName}:`, err);
    throw err;
  }
}
