import { PrismaClient } from '@prisma/client';
import { getDeterministicUuid } from '../src/utils/uuid';

const prisma = new PrismaClient();

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_EMAIL = 'kumar.gourav@kgos.ai';
const DEFAULT_NAME = 'Kumar Gourav';

const profileId = getDeterministicUuid(DEFAULT_USER_ID);

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() - n);
  return d;
};

const daysAgoStr = (n: number) => {
  return daysAgo(n).toISOString().split('T')[0];
};

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create or get profile
  let profile = await prisma.profile.findUnique({
    where: { id: profileId }
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: profileId,
        email: DEFAULT_EMAIL,
        name: DEFAULT_NAME,
        mission: 'To construct world-class systems combining Agri-Food engineering (KAFS), advanced research, and structural self-mastery.',
        vision: 'A unified operational command where functionality emerges from interactions, scaling B2B enterprise value and academic authority.',
        strengths: ['Hydrocolloids formulation', 'B2B sales pipeline design', 'Research translation', 'Multi-domain scheduling'],
        weaknesses: ['Sleep debt accumulation', 'High-context multitasking overhead', 'Spasmodic personal brand distribution'],
        decisionStyle: 'Data-driven, low-frequency, high-conviction.',
        learningStyle: 'Structured academic synthesis.'
      }
    });
    console.log('👤 Profile created for Kumar Gourav.');
  } else {
    console.log('👤 Profile already exists.');
  }

  // 2. Clear old data to prevent duplication issues
  console.log('🧹 Clearing old tables for user...');
  const userId = profileId;
  const whereUser = { where: { userId } };

  await prisma.task.deleteMany(whereUser);
  await prisma.goal.deleteMany(whereUser);
  await prisma.lead.deleteMany(whereUser);
  await prisma.dailyLog.deleteMany(whereUser);
  await prisma.researchPaper.deleteMany(whereUser);
  await prisma.exam.deleteMany(whereUser);
  await prisma.knowledgeNote.deleteMany(whereUser);
  await prisma.document.deleteMany(whereUser);
  await prisma.project.deleteMany(whereUser);
  await prisma.product.deleteMany(whereUser);
  await prisma.supplier.deleteMany(whereUser);
  await prisma.transaction.deleteMany(whereUser);
  await prisma.contact.deleteMany(whereUser);
  await prisma.opportunity.deleteMany(whereUser);
  await prisma.timeAllocation.deleteMany(whereUser);
  await prisma.formulation.deleteMany(whereUser);
  await prisma.ingredient.deleteMany(whereUser);
  await prisma.batchRecord.deleteMany(whereUser);
  await prisma.studySession.deleteMany(whereUser);
  await prisma.studyTopic.deleteMany(whereUser);
  await prisma.mockTest.deleteMany(whereUser);
  await prisma.contentPiece.deleteMany(whereUser);
  await prisma.notification.deleteMany(whereUser);
  await prisma.healthGoal.deleteMany(whereUser);
  await prisma.budgetCategory.deleteMany(whereUser);
  await prisma.automationRule.deleteMany(whereUser);

  // 3. Populate Ingredients
  console.log('📦 Seeding Ingredients...');
  await prisma.ingredient.createMany({
    data: [
      { userId, name: 'Kappa Carrageenan', category: 'Hydrocolloid', type: 'Seaweed Extract', costPerKg: 450, description: 'Strong rigid gel with K+ ions. Primarily from Kappaphycus alvarezii.', properties: JSON.stringify({ gelType: 'Rigid', ionSensitive: 'K+', usage: '0.01-0.05%', solubility: 'Hot' }), regulatoryStatus: 'GRAS, INS 407' },
      { userId, name: 'Iota Carrageenan', category: 'Hydrocolloid', type: 'Seaweed Extract', costPerKg: 480, description: 'Elastic thixotropic gel with Ca2+ ions. Excellent freeze-thaw stability.', properties: JSON.stringify({ gelType: 'Elastic', ionSensitive: 'Ca2%', usage: '0.01-0.04%', solubility: 'Hot' }), regulatoryStatus: 'GRAS, INS 407' },
      { userId, name: 'Lambda Carrageenan', category: 'Hydrocolloid', type: 'Seaweed Extract', costPerKg: 520, description: 'Non-gelling, cold-soluble thickener. Used for creamy textures.', properties: JSON.stringify({ gelType: 'None', ionSensitive: 'None', usage: '0.01-0.04%', solubility: 'Cold' }), regulatoryStatus: 'GRAS, INS 407' },
      { userId, name: 'Locust Bean Gum', category: 'Hydrocolloid', type: 'Seed Gum', costPerKg: 320, description: 'Galactomannan synergist. Enhances kappa gel strength and reduces syneresis.', properties: JSON.stringify({ synergy: 'Kappa, Xanthan', usage: '0.02-0.1%', solubility: 'Hot' }), regulatoryStatus: 'GRAS, INS 410' },
      { userId, name: 'Guar Gum', category: 'Hydrocolloid', type: 'Seed Gum', costPerKg: 180, description: 'High-viscosity, cold-soluble galactomannan. Widely used in ice cream and sauces.', properties: JSON.stringify({ usage: '0.01-0.05%', solubility: 'Cold', viscosity: 'High' }), regulatoryStatus: 'GRAS, INS 412' },
      { userId, name: 'Xanthan Gum', category: 'Hydrocolloid', type: 'Microbial', costPerKg: 290, description: 'Microbially-derived polysaccharide. Excellent thickener and stabilizer in acidic systems.', properties: JSON.stringify({ usage: '0.01-0.05%', solubility: 'Cold', shearThinning: true }), regulatoryStatus: 'GRAS, INS 415' }
    ]
  });

  // 4. Populate Products
  console.log('🛍️ Seeding Products...');
  await prisma.product.createMany({
    data: [
      { userId, name: 'Kappa-Carrageenan Ice Cream Blend KB-20', category: 'HYDROCOLLOIDS', isActive: true },
      { userId, name: 'Iota-Carrageenan Gummy Blend IB-05', category: 'CARRAGEENAN', isActive: true },
      { userId, name: 'Locust Bean Gum Cold-Soluble Grade LB-10', category: 'HYDROCOLLOIDS', isActive: true }
    ]
  });

  // 5. Populate Suppliers
  console.log('🤝 Seeding Suppliers...');
  await prisma.supplier.createMany({
    data: [
      { userId, name: 'Oceanic Seaweed Extracts Ltd', contactPerson: 'M. Pillai', email: 'pillai@oceanic.in' },
      { userId, name: 'Global Thickener Trading Corp', contactPerson: 'Sarah Chen', email: 'schen@globalthickener.com' },
      { userId, name: 'Marinalg International', contactPerson: 'Pierre Dubois', email: 'p.dubois@marinalg.fr' }
    ]
  });

  // 6. Populate Formulations
  console.log('🔬 Seeding Formulations...');
  await prisma.formulation.createMany({
    data: [
      {
        userId,
        name: 'Ice Cream Stabilizer Blend KB-20',
        description: 'Kappa-Carrageenan + Locust Bean Gum optimized blend for reduced-fat ice cream. Minimizes syneresis and improves melt resistance.',
        version: '2.0',
        ingredientsList: JSON.stringify([
          { name: 'Kappa Carrageenan', pct: 0.025, cost: 450 },
          { name: 'Locust Bean Gum', pct: 0.05, cost: 320 },
          { name: 'Guar Gum', pct: 0.015, cost: 180 }
        ]),
        targetApplication: 'Ice Cream / Frozen Desserts',
        processingNotes: 'Disperse in cold water at 5°C, heat to 70°C while stirring. Allow 20 min hydration before mixing into base.',
        results: JSON.stringify({ gelStrength: 320, viscosity: '5800 cP', syneresis: '< 2%', meltResistance: 'Excellent' }),
        status: 'Active',
        costPerKg: 38.5
      },
      {
        userId,
        name: 'Yogurt Stabilizer YS-10',
        description: 'Low-fat yogurt stabilizer with smooth mouthfeel. Target: set-style fermented dairy without post-process syneresis.',
        version: '1.3',
        ingredientsList: JSON.stringify([
          { name: 'Iota Carrageenan', pct: 0.02, cost: 480 },
          { name: 'Modified Starch', pct: 0.08, cost: 95 },
          { name: 'Pectin HM', pct: 0.01, cost: 600 }
        ]),
        targetApplication: 'Set Yogurt / Fermented Dairy',
        processingNotes: 'Pre-hydrate in cold milk, pasteurize at 85°C/15s. Inoculate at 42°C.',
        results: JSON.stringify({ gelStrength: 180, viscosity: '8200 cP', syneresis: '< 1%', texture: 'Smooth, cohesive' }),
        status: 'Active',
        costPerKg: 52.2
      }
    ]
  });

  // 7. Populate Tasks
  console.log('✔️ Seeding Tasks...');
  await prisma.task.createMany({
    data: [
      { userId, title: 'Formulate stabilizer prototype for dairy trials', status: 'IN_PROGRESS', priority: 'HIGH', category: 'Business', dueDate: daysAgo(-4) },
      { userId, title: 'Review ICAR agricultural inputs exam syllabus', status: 'TODO', priority: 'MEDIUM', category: 'Government Exams', dueDate: daysAgo(-8) },
      { userId, title: 'Perform rheology testing on Kappa Carrageenan batch', status: 'DONE', priority: 'HIGH', category: 'Research', dueDate: daysAgo(2) },
      { userId, title: 'Plan weekly macros and workout schedule', status: 'TODO', priority: 'LOW', category: 'Health', dueDate: daysAgo(-1) },
      { userId, title: 'Draft LinkedIn article on hydrocolloid blending optimizations', status: 'TODO', priority: 'MEDIUM', category: 'Content', dueDate: daysAgo(-6) },
      { userId, title: 'Follow up with Amul Dairy procurement team', status: 'TODO', priority: 'HIGH', category: 'Business', dueDate: daysAgo(-2) },
      { userId, title: 'Complete FSSAI mock test - Food Safety Regulations', status: 'DONE', priority: 'HIGH', category: 'Government Exams', dueDate: daysAgo(1) }
    ]
  });

  // 8. Populate Goals
  console.log('🏆 Seeding Goals...');
  await prisma.goal.createMany({
    data: [
      { userId, title: 'Establish KAFS as India\'s primary hydrocolloid stabilizer blend house', description: 'Cross ₹100Cr in revenue and setup blending manufacturing plant.', progress: 15, dueDate: daysAgo(-3650), category: '10 Year' },
      { userId, title: 'Build high-care blending plant facility', description: 'Set up manufacturing and compliance lines for proprietary Carrageenan blends.', progress: 20, dueDate: daysAgo(-1800), category: '5 Year' },
      { userId, title: 'Complete PhD in Food Technology', description: 'Target IIT or NIFTEM. Specialisation in hydrocolloid rheology systems.', progress: 30, dueDate: daysAgo(-1400), category: '5 Year' },
      { userId, title: 'Acquire FSSAI and ISO certifications for plant formulations', description: 'Ensure full regulatory approval on all commercial stabilizers.', progress: 40, dueDate: daysAgo(-180), category: 'Annual' },
      { userId, title: 'Qualify B2B pipeline worth ₹50 Lakhs in dairy sector', description: 'Add and test samples with 10 high-value processing plants.', progress: 60, dueDate: daysAgo(-90), category: 'Quarterly' }
    ]
  });

  // 9. Populate CRM Leads
  console.log('📊 Seeding CRM Leads...');
  await prisma.lead.createMany({
    data: [
      { userId, companyName: 'Heritage Foods Ltd', contactPerson: 'Dr. Ramesh Kumar', phone: '+91 98765 43210', email: 'ramesh.k@heritage.com', productInterest: 'Kappa Carrageenan', status: 'Trial', stage: 'TRIAL', notes: 'Testing customized stabilizer batch to reduce syneresis in ice cream.', nextFollowUp: daysAgo(-3), opportunityValue: 250000, industry: 'Dairy' },
      { userId, companyName: 'Kwality Confectionery', contactPerson: 'Anil Mehta', email: 'mehta.anil@kwality.in', productInterest: 'Iota Carrageenan', status: 'Sample Sent', stage: 'SAMPLE_SENT', notes: 'Gummy candy prototype stabilizers matching pectin alternative requirements.', nextFollowUp: daysAgo(-6), opportunityValue: 120000, industry: 'Confectionery' },
      { userId, companyName: 'Amul Dairy Co-op', contactPerson: 'Sanjay Shah', status: 'Lead', stage: 'NEW', notes: 'Initial outreach regarding high-viscosity thickeners for yogurt stabilizer formulations.', nextFollowUp: daysAgo(-1), opportunityValue: 500000, industry: 'Dairy' },
      { userId, companyName: 'ITC Foods Division', contactPerson: 'Priya Nair', email: 'p.nair@itcfoods.in', productInterest: 'Lambda Carrageenan', status: 'Contacted', stage: 'CONTACTED', notes: 'Interested in cold-soluble carrageenan for instant dessert powder premixes.', nextFollowUp: daysAgo(-4), opportunityValue: 380000, industry: 'Food Processing' }
    ]
  });

  // 10. Populate Daily Logs (combines legacy health logs and reviews)
  console.log('📅 Seeding Daily Logs...');
  const logs = [];
  for (let i = 29; i >= 0; i--) {
    const energyVal = Math.min(10, Math.max(4, 7 + Math.round(Math.sin(i * 0.7) * 2)));
    const sleepVal = +(Math.min(9, Math.max(5, 6.8 + Math.sin(i * 0.5) * 1.2)).toFixed(1));
    
    logs.push({
      userId,
      date: daysAgo(i),
      weight: +(76.5 - i * 0.05 + Math.sin(i) * 0.3).toFixed(1),
      sleepHours: sleepVal,
      sleepQuality: Math.round(sleepVal),
      waterIntakeMl: (2600 + (i % 4) * 200),
      exerciseMins: Math.max(0, 35 + Math.round(Math.sin(i * 1.3) * 20)),
      energyLevel: energyVal,
      priorities: i === 1 ? ['Run Kappa formulations viscosity test', 'Call Heritage Foods', 'Complete FSSAI mock paper'] : [],
      wins: i === 1 ? ['Dr. Ramesh Kumar accepted prototype sample', 'Finished carrageenan ratio experiments'] : [],
      challenges: i === 1 ? ['Lab heating block temp fluctuated'] : [],
      learnings: i === 1 ? ['Calibrate temperature logs hourly for consistency'] : []
    });
  }
  await prisma.dailyLog.createMany({ data: logs });

  // 11. Populate Research Papers
  console.log('🔬 Seeding Research Papers...');
  await prisma.researchPaper.createMany({
    data: [
      { userId, title: 'Viscosity and gelation synergy of carrageenan-locust bean gum blends', topic: 'Carrageenan Rheology', status: 'Completed', summary: 'Outlines details regarding optimal blending ratio parameters to maximize texture strength.' },
      { userId, title: 'Thermal degradation indexes in semi-refined seaweed extracts', topic: 'Carrageenan Manufacturing', status: 'In Progress', summary: 'Assessing hot-alkali treatment thermal profile limits.' },
      { userId, title: 'Cold-soluble carrageenan applications in low-fat dairy', topic: 'Food Technology', status: 'Planned', summary: 'Literature review on cold-gelling k-carrageenan blends for yogurt stabilization.' }
    ]
  });

  // 12. Populate Exams
  console.log('📝 Seeding Exams...');
  await prisma.exam.createMany({
    data: [
      { userId, name: 'FSSAI Technical Officer Exam', applicationDate: daysAgo(30), examDate: daysAgo(-60), status: 'Active', notes: 'Focus study areas: food safety regulations, testing standards, FSSAI Acts.', studyHours: 85 },
      { userId, name: 'ICAR Agricultural Research Service (ARS)', applicationDate: daysAgo(10), examDate: daysAgo(-120), status: 'Planned', notes: 'Focus: agricultural post-harvest technology and food processing rules.', studyHours: 40 }
    ]
  });

  // 13. Populate Knowledge Base
  console.log('🧠 Seeding Knowledge Base...');
  await prisma.knowledgeNote.createMany({
    data: [
      { userId, title: 'Kappa vs Iota gelation patterns', content: 'Kappa forms rigid and brittle gel with potassium ions. Iota forms elastic and cohesive gel with calcium ions. Lambda does not gel — it acts as thickener only.', tags: ['carrageenan', 'gel strength', 'rheology'], category: 'Research' },
      { userId, title: 'B2B Objection handling for stabilizer pricing', content: 'Emphasize cost-in-use benefits: stabilizer constitutes only 0.2% of formulation while reducing product wastage by 15%. ROI > 40x on ingredient cost.', tags: ['sales', 'crm', 'objection'], category: 'Business Knowledge' },
      { userId, title: 'FSSAI Schedule 5 — Permitted Food Additives', content: 'Key stabilizers permitted: Carrageenan (INS 407), Locust Bean Gum (INS 410), Guar Gum (INS 412), Xanthan Gum (INS 415). Max usage levels vary by product category.', tags: ['fssai', 'regulation', 'exams'], category: 'Government Exams' }
    ]
  });

  // 14. Populate Documents
  console.log('📂 Seeding Documents...');
  await prisma.document.createMany({
    data: [
      { userId, fileName: 'Stabilizer_Spec_Sheet_V1.pdf', fileUrl: '#', fileType: 'pdf' },
      { userId, fileName: 'Lead_Outreach_List.xlsx', fileUrl: '#', fileType: 'xlsx' }
    ]
  });

  // 15. Populate Projects
  console.log('📂 Seeding Projects...');
  await prisma.project.createMany({
    data: [
      { userId, title: 'Kappa formulations mix optimization', name: 'Kappa formulations mix optimization', objective: 'Find optimal ratio of Kappa Carrageenan and Locust Bean Gum to maximize viscosity.', description: 'Find optimal ratio of Kappa Carrageenan and Locust Bean Gum to maximize viscosity.', status: 'ACTIVE', priority: 'HIGH', progress: 45, category: 'Research' },
      { userId, title: 'FSSAI compliance approval preparation', name: 'FSSAI compliance approval preparation', objective: 'Collect and file all documentation for regulatory formulation review.', description: 'Collect and file all documentation for regulatory formulation review.', status: 'PLANNING', priority: 'MEDIUM', progress: 20, category: 'Government Exams' }
    ]
  });

  // 16. Populate Transactions
  console.log('💳 Seeding Transactions...');
  await prisma.transaction.createMany({
    data: [
      { userId, date: daysAgo(58), amount: 120000, type: 'INCOME', category: 'Consulting', description: 'Food tech advisory — startup retainer' },
      { userId, date: daysAgo(55), amount: 32000, type: 'EXPENSE', category: 'Lab Supplies', description: 'Carrageenan raw material purchase' },
      { userId, date: daysAgo(50), amount: 85000, type: 'INCOME', category: 'Product Sales', description: 'KB-20 blend — Heritage Foods first order' },
      { userId, date: daysAgo(35), amount: 150000, type: 'INCOME', category: 'Consulting', description: 'FSSAI formulations advisory retainer fee' },
      { userId, date: daysAgo(28), amount: 96000, type: 'INCOME', category: 'Product Sales', description: 'IB-05 gummy blend — Kwality order 2' },
      { userId, date: daysAgo(10), amount: 180000, type: 'INCOME', category: 'Consulting', description: 'Q2 retainer — dairy stabilizer R&D' }
    ]
  });

  // 17. Populate Contacts
  console.log('📇 Seeding Contacts...');
  await prisma.contact.createMany({
    data: [
      { userId, name: 'Dr. Ramesh Kumar', role: 'Mentors', email: 'ramesh.k@heritage.com', phone: '+91 98765 43210', interactionScore: 90, lastInteraction: daysAgo(1), notes: 'R&D Director at Heritage Foods. Advising on Carrageenan blend trials.' },
      { userId, name: 'Dr. V. Prasad', role: 'Experts', email: 'vprasad@niftem.ac.in', interactionScore: 82, lastInteraction: daysAgo(12), notes: 'NIFTEM Food Tech professor. Potential PhD advisor for hydrocolloid research.' },
      { userId, name: 'Sanjay Shah', role: 'Customers', email: 'sshah@amul.coop', phone: '+91 87654 32109', interactionScore: 74, lastInteraction: daysAgo(3), notes: 'Procurement Head at Amul Dairy. Currently evaluating our yogurt stabilizer system.' }
    ]
  });

  // 18. Populate Opportunities
  console.log('💡 Seeding Opportunities...');
  await prisma.opportunity.createMany({
    data: [
      { userId, title: 'DBT Hydrocolloid R&D Grant', source: 'Grants', roiScore: 88, revenueImpact: 1200000, alignmentScore: 95, effortScore: 40, notes: 'Department of Biotechnology R&D assistance. Application open July 2026.' },
      { userId, title: 'Kwality Foods Stabilizer Supply Contract', source: 'Customers', roiScore: 78, revenueImpact: 4500000, alignmentScore: 85, effortScore: 65, notes: 'Targeting 2 Tons per month stabilizer sourcing agreement.' }
    ]
  });

  // 19. Populate Time Allocations
  console.log('⏰ Seeding Time Allocations...');
  const timeCategories = ['Business', 'Research', 'Exams', 'Health', 'Career', 'Brand'];
  const baseAllocation: Record<string, number> = { Business: 6, Research: 3, Exams: 4, Health: 1.5, Career: 1, Brand: 1 };
  const timeRows = [];

  for (let i = 14; i >= 0; i--) {
    const date = daysAgo(i);
    for (const category of timeCategories) {
      const base = baseAllocation[category];
      const noise = Math.sin(i * 0.8 + category.length) * 0.8 + (i % 3 === 0 ? -0.5 : 0.3);
      timeRows.push({
        userId,
        date,
        category,
        hoursPlanned: base,
        hoursActual: Math.max(0, +(base + noise).toFixed(1))
      });
    }
  }
  await prisma.timeAllocation.createMany({ data: timeRows });

  // 20. Populate Study Sessions
  console.log('📚 Seeding Study Sessions...');
  await prisma.studySession.createMany({
    data: [
      { userId, subject: 'Food Safety Law', topic: 'FSSAI Act 2006 - Part I & II', durationMinutes: 90, date: daysAgo(1), notes: 'Covered definitions, licensing, and penalty provisions.' },
      { userId, subject: 'Food Microbiology', topic: 'Pathogen control and HACCP principles', durationMinutes: 60, date: daysAgo(2), notes: 'Key organisms: Listeria monocytogenes, Salmonella spp.' }
    ]
  });

  // 21. Populate Study Topics
  console.log('📖 Seeding Study Topics...');
  await prisma.studyTopic.createMany({
    data: [
      { userId, name: 'FSSAI Act 2006 & Amendments', subject: 'Food Safety Law', status: 'Completed', importance: 3, lastRevised: daysAgo(1), nextRevision: daysAgo(-7) },
      { userId, name: 'Schedule V - Food Additives & INS Numbers', subject: 'Food Safety Law', status: 'In Progress', importance: 3, lastRevised: daysAgo(4) }
    ]
  });

  // 22. Populate Mock Tests
  console.log('💯 Seeding Mock Tests...');
  await prisma.mockTest.createMany({
    data: [
      { userId, title: 'FSSAI Full Mock - Series 1', subject: 'Food Safety Law', totalQuestions: 100, correctAnswers: 68, timeTaken: 105, dateTaken: daysAgo(8) },
      { userId, title: 'Food Chemistry Quick Test', subject: 'Food Chemistry', totalQuestions: 50, correctAnswers: 38, timeTaken: 55, dateTaken: daysAgo(10) }
    ]
  });

  // 23. Populate Content Pieces
  console.log('✍️ Seeding Content Pieces...');
  await prisma.contentPiece.createMany({
    data: [
      { userId, title: 'Why Kappa Carrageenan Outperforms Starch in Ice Cream', type: 'LinkedIn', status: 'Published', content: 'Most ice cream manufacturers default to starch. Here\'s why...', tags: 'carrageenan,ice cream,food science', publishedDate: daysAgo(5), impressions: 2840, engagements: 187, platform: 'LinkedIn' },
      { userId, title: 'The Hydrocolloid Synergy: κ-Carrageenan + LBG', type: 'LinkedIn', status: 'Published', content: 'Two hydrocolloids combined at the right ratio create something extraordinary...', tags: 'hydrocolloid,synergy,food tech', publishedDate: daysAgo(12), impressions: 4120, engagements: 310, platform: 'LinkedIn' }
    ]
  });

  // 24. Populate Notifications
  console.log('🔔 Seeding Notifications...');
  await prisma.notification.createMany({
    data: [
      { userId, title: 'Follow-up Overdue', message: 'Heritage Foods follow-up was due 3 days ago.', type: 'warning', read: false, link: '/business/crm/leads' },
      { userId, title: 'FSSAI Exam in 65 days', message: 'Your FSSAI Technical Officer exam is on 20 Aug 2026. Review weak topics.', type: 'warning', read: false, link: '/exams' }
    ]
  });

  // 25. Populate Health Goals
  console.log('🏃 Seeding Health Goals...');
  await prisma.healthGoal.createMany({
    data: [
      { userId, metric: 'weight', target: 72, unit: 'kg', deadline: daysAgo(-180) },
      { userId, metric: 'sleep', target: 7.5, unit: 'hours' },
      { userId, metric: 'water', target: 3000, unit: 'ml/day' }
    ]
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
