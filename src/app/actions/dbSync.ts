'use server';

import { prisma } from '@/db/prisma';
import { getOrCreateProfile } from './helper';
import { serializeBigInt } from '@/utils/serialize';

function parseDate(d?: string | null): Date | null {
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function parseRequiredDate(d: string): Date {
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function syncDexieToCloudAction(payload: {
  tasks?: any[];
  goals?: any[];
  leads?: any[];
  healthLogs?: any[];
  researchPapers?: any[];
  exams?: any[];
  knowledgeNotes?: any[];
  documents?: any[];
  transactions?: any[];
  contacts?: any[];
  opportunities?: any[];
  timeAllocations?: any[];
  products?: any[];
  suppliers?: any[];
}) {
  try {
    const profile = await getOrCreateProfile();
    const userId = profile.id;

    // 1. Sync Tasks
    if (payload.tasks && payload.tasks.length > 0) {
      for (const t of payload.tasks) {
        await prisma.task.upsert({
          where: { id: BigInt(t.id) },
          update: {
            title: t.title,
            description: t.description || null,
            status: t.status,
            priority: t.priority,
            category: t.category || null,
            dueDate: parseDate(t.dueDate),
            updatedAt: new Date()
          },
          create: {
            id: BigInt(t.id),
            userId,
            title: t.title,
            description: t.description || null,
            status: t.status,
            priority: t.priority,
            category: t.category || null,
            dueDate: parseDate(t.dueDate),
            createdAt: parseRequiredDate(t.createdAt)
          }
        });
      }
    }

    // 2. Sync Goals
    if (payload.goals && payload.goals.length > 0) {
      for (const g of payload.goals) {
        await prisma.goal.upsert({
          where: { id: BigInt(g.id) },
          update: {
            title: g.title,
            description: g.description || null,
            progress: g.progress || 0,
            dueDate: parseDate(g.dueDate),
            category: g.category || null,
            updatedAt: new Date()
          },
          create: {
            id: BigInt(g.id),
            userId,
            title: g.title,
            description: g.description || null,
            progress: g.progress || 0,
            dueDate: parseDate(g.dueDate),
            category: g.category || null,
            createdAt: parseRequiredDate(g.createdAt)
          }
        });
      }
    }

    // 3. Sync CRM Leads
    if (payload.leads && payload.leads.length > 0) {
      for (const l of payload.leads) {
        await prisma.lead.upsert({
          where: { id: BigInt(l.id) },
          update: {
            companyName: l.companyName,
            contactPerson: l.contactPerson,
            phone: l.phone || null,
            email: l.email || null,
            productInterest: l.productInterest || null,
            status: l.status,
            notes: l.notes || null,
            nextFollowUp: parseDate(l.nextFollowUp),
            opportunityValue: l.opportunityValue || 0.00,
            industry: l.industry || null,
            updatedAt: new Date()
          },
          create: {
            id: BigInt(l.id),
            userId,
            companyName: l.companyName,
            contactPerson: l.contactPerson,
            phone: l.phone || null,
            email: l.email || null,
            productInterest: l.productInterest || null,
            status: l.status,
            notes: l.notes || null,
            nextFollowUp: parseDate(l.nextFollowUp),
            opportunityValue: l.opportunityValue || 0.00,
            industry: l.industry || null,
            createdAt: parseRequiredDate(l.createdAt)
          }
        });
      }
    }

    // 4. Sync Health Logs (DailyLog)
    if (payload.healthLogs && payload.healthLogs.length > 0) {
      for (const hl of payload.healthLogs) {
        const logDate = parseRequiredDate(hl.date);
        // Date is unique, check if exists by date
        const existing = await prisma.dailyLog.findUnique({
          where: { date: logDate }
        });

        if (existing) {
          await prisma.dailyLog.update({
            where: { date: logDate },
            data: {
              weight: hl.weight || null,
              sleepHours: hl.sleep || hl.sleepHours || null,
              sleepQuality: hl.sleepQuality || null,
              waterIntakeMl: hl.waterIntake !== undefined ? Math.round(hl.waterIntake * 250) : null,
              exerciseMins: hl.exercise || null,
              energyLevel: hl.energy || hl.energyLevel || null
            }
          });
        } else {
          await prisma.dailyLog.create({
            data: {
              id: BigInt(hl.id),
              userId,
              date: logDate,
              weight: hl.weight || null,
              sleepHours: hl.sleep || hl.sleepHours || null,
              sleepQuality: hl.sleepQuality || null,
              waterIntakeMl: hl.waterIntake !== undefined ? Math.round(hl.waterIntake * 250) : null,
              exerciseMins: hl.exercise || null,
              energyLevel: hl.energy || hl.energyLevel || null,
              createdAt: parseRequiredDate(hl.createdAt || hl.date)
            }
          });
        }
      }
    }

    // 5. Sync Research Papers
    if (payload.researchPapers && payload.researchPapers.length > 0) {
      for (const rp of payload.researchPapers) {
        await prisma.researchPaper.upsert({
          where: { id: BigInt(rp.id) },
          update: {
            title: rp.title,
            topic: rp.topic,
            status: rp.status,
            summary: rp.summary || null,
            updatedAt: new Date()
          },
          create: {
            id: BigInt(rp.id),
            userId,
            title: rp.title,
            topic: rp.topic,
            status: rp.status,
            summary: rp.summary || null,
            createdAt: parseRequiredDate(rp.createdAt)
          }
        });
      }
    }

    // 6. Sync Government Exams
    if (payload.exams && payload.exams.length > 0) {
      for (const ex of payload.exams) {
        await prisma.exam.upsert({
          where: { id: BigInt(ex.id) },
          update: {
            name: ex.name,
            applicationDate: parseDate(ex.applicationDate),
            examDate: parseDate(ex.examDate),
            status: ex.status,
            notes: ex.notes || null,
            studyHours: ex.studyHours || 0.00,
            updatedAt: new Date()
          },
          create: {
            id: BigInt(ex.id),
            userId,
            name: ex.name,
            applicationDate: parseDate(ex.applicationDate),
            examDate: parseDate(ex.examDate),
            status: ex.status,
            notes: ex.notes || null,
            studyHours: ex.studyHours || 0.00,
            createdAt: parseRequiredDate(ex.createdAt)
          }
        });
      }
    }

    // 7. Sync Knowledge Base Notes
    if (payload.knowledgeNotes && payload.knowledgeNotes.length > 0) {
      for (const kn of payload.knowledgeNotes) {
        await prisma.knowledgeNote.upsert({
          where: { id: BigInt(kn.id) },
          update: {
            title: kn.title,
            content: kn.content || null,
            tags: kn.tags || [],
            category: kn.category || null,
            updatedAt: new Date()
          },
          create: {
            id: BigInt(kn.id),
            userId,
            title: kn.title,
            content: kn.content || null,
            tags: kn.tags || [],
            category: kn.category || null,
            createdAt: parseRequiredDate(kn.createdAt)
          }
        });
      }
    }

    // 8. Sync Documents
    if (payload.documents && payload.documents.length > 0) {
      for (const doc of payload.documents) {
        await prisma.document.upsert({
          where: { id: BigInt(doc.id) },
          update: {
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType,
            uploadedAt: parseRequiredDate(doc.uploadedAt)
          },
          create: {
            id: BigInt(doc.id),
            userId,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType,
            uploadedAt: parseRequiredDate(doc.uploadedAt)
          }
        });
      }
    }

    // 9. Sync Wealth Transactions
    if (payload.transactions && payload.transactions.length > 0) {
      for (const t of payload.transactions) {
        await prisma.transaction.upsert({
          where: { id: BigInt(t.id) },
          update: {
            date: parseRequiredDate(t.date),
            amount: t.amount,
            type: t.type,
            category: t.category,
            description: t.description || null
          },
          create: {
            id: BigInt(t.id),
            userId,
            date: parseRequiredDate(t.date),
            amount: t.amount,
            type: t.type,
            category: t.category,
            description: t.description || null,
            createdAt: parseRequiredDate(t.createdAt || t.date)
          }
        });
      }
    }

    // 10. Sync Contacts
    if (payload.contacts && payload.contacts.length > 0) {
      for (const c of payload.contacts) {
        await prisma.contact.upsert({
          where: { id: BigInt(c.id) },
          update: {
            name: c.name,
            role: c.role,
            email: c.email || null,
            phone: c.phone || null,
            relationshipScore: c.relationshipScore || c.interactionScore || 50,
            lastInteraction: parseDate(c.lastInteraction || c.lastContact),
            notes: c.notes || null
          },
          create: {
            id: BigInt(c.id),
            userId,
            name: c.name,
            role: c.role,
            email: c.email || null,
            phone: c.phone || null,
            relationshipScore: c.relationshipScore || c.interactionScore || 50,
            lastInteraction: parseDate(c.lastInteraction || c.lastContact),
            notes: c.notes || null,
            createdAt: parseRequiredDate(c.createdAt)
          }
        });
      }
    }

    // 11. Sync Opportunities
    if (payload.opportunities && payload.opportunities.length > 0) {
      for (const o of payload.opportunities) {
        await prisma.opportunity.upsert({
          where: { id: BigInt(o.id) },
          update: {
            title: o.title,
            source: o.source,
            roiScore: o.roiScore || null,
            revenueImpact: o.revenueImpact || 0.00,
            alignmentScore: o.alignmentScore || null,
            effortScore: o.effortScore || null,
            notes: o.notes || null
          },
          create: {
            id: BigInt(o.id),
            userId,
            title: o.title,
            source: o.source,
            roiScore: o.roiScore || null,
            revenueImpact: o.revenueImpact || 0.00,
            alignmentScore: o.alignmentScore || null,
            effortScore: o.effortScore || null,
            notes: o.notes || null,
            createdAt: parseRequiredDate(o.createdAt)
          }
        });
      }
    }

    // 12. Sync Time Allocations
    if (payload.timeAllocations && payload.timeAllocations.length > 0) {
      for (const ta of payload.timeAllocations) {
        await prisma.timeAllocation.upsert({
          where: { id: BigInt(ta.id) },
          update: {
            date: parseRequiredDate(ta.date),
            category: ta.category,
            hoursPlanned: ta.hoursPlanned || ta.hours_planned || 0,
            hoursActual: ta.hoursActual || ta.hours_actual || 0
          },
          create: {
            id: BigInt(ta.id),
            userId,
            date: parseRequiredDate(ta.date),
            category: ta.category,
            hoursPlanned: ta.hoursPlanned || ta.hours_planned || 0,
            hoursActual: ta.hoursActual || ta.hours_actual || 0,
            createdAt: parseRequiredDate(ta.createdAt || ta.date)
          }
        });
      }
    }

    // 13. Sync Products
    if (payload.products && payload.products.length > 0) {
      for (const p of payload.products) {
        await prisma.product.upsert({
          where: { id: BigInt(p.id) },
          update: {
            name: p.name,
            category: p.category,
            isActive: p.isActive !== undefined ? p.isActive : true
          },
          create: {
            id: BigInt(p.id),
            userId,
            name: p.name,
            category: p.category,
            isActive: p.isActive !== undefined ? p.isActive : true,
            createdAt: parseRequiredDate(p.createdAt)
          }
        });
      }
    }

    // 14. Sync Suppliers
    if (payload.suppliers && payload.suppliers.length > 0) {
      for (const s of payload.suppliers) {
        await prisma.supplier.upsert({
          where: { id: BigInt(s.id) },
          update: {
            name: s.name,
            contactPerson: s.contactPerson || null,
            phone: s.phone || null,
            email: s.email || null
          },
          create: {
            id: BigInt(s.id),
            userId,
            name: s.name,
            contactPerson: s.contactPerson || null,
            phone: s.phone || null,
            email: s.email || null,
            createdAt: parseRequiredDate(s.createdAt)
          }
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Prisma Cloud Sync Server Action failed:', err);
    return { success: false, error: err.message };
  }
}

export async function pullCloudDataAction() {
  try {
    const profile = await getOrCreateProfile();
    const userId = profile.id;

    const [
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
    ] = await Promise.all([
      prisma.task.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.lead.findMany({ where: { userId } }),
      prisma.dailyLog.findMany({ where: { userId } }),
      prisma.researchPaper.findMany({ where: { userId } }),
      prisma.exam.findMany({ where: { userId } }),
      prisma.knowledgeNote.findMany({ where: { userId } }),
      prisma.document.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId } }),
      prisma.contact.findMany({ where: { userId } }),
      prisma.opportunity.findMany({ where: { userId } }),
      prisma.timeAllocation.findMany({ where: { userId } }),
      prisma.product.findMany({ where: { userId } }),
      prisma.supplier.findMany({ where: { userId } })
    ]);

    const result = {
      tasks,
      goals,
      leads,
      healthLogs: healthLogs.map((hl: any) => ({
        ...hl,
        sleep: hl.sleepHours,
        sleepHours: hl.sleepHours,
        sleepQuality: hl.sleepQuality,
        waterIntake: hl.waterIntakeMl ? Number((hl.waterIntakeMl / 250).toFixed(1)) : undefined,
        exercise: hl.exerciseMins,
        energy: hl.energyLevel,
        energyLevel: hl.energyLevel
      })),
      researchPapers,
      exams,
      knowledgeNotes,
      documents,
      transactions,
      contacts: contacts.map((c: any) => ({
        ...c,
        interactionScore: c.relationshipScore,
        lastContact: c.lastInteraction
      })),
      opportunities,
      timeAllocations,
      products,
      suppliers
    };

    return {
      success: true,
      data: serializeBigInt(result)
    };
  } catch (err: any) {
    console.error('Prisma Pull Cloud Data Server Action failed:', err);
    return { success: false, error: err.message };
  }
}
