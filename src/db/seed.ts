import { db } from './database';

export async function seedDatabase(): Promise<void> {
  const today = new Date();

  // ── Helper: build date string N days ago ──────────────────────────────────
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  console.log('Running KGOS enterprise seed check…');

  // ── 1. Tasks ──────────────────────────────────────────────────────────────
  if ((await db.tasks.count()) === 0) {
    await db.tasks.bulkAdd([
      { title: 'Formulate stabilizer prototype for dairy trials', status: 'IN_PROGRESS', priority: 'HIGH', category: 'Business', dueDate: daysAgo(-4), createdAt: new Date().toISOString() },
      { title: 'Review ICAR agricultural inputs exam syllabus', status: 'TODO', priority: 'MEDIUM', category: 'Government Exams', dueDate: daysAgo(-8), createdAt: new Date().toISOString() },
      { title: 'Perform rheology testing on Kappa Carrageenan batch', status: 'DONE', priority: 'HIGH', category: 'Research', dueDate: daysAgo(2), createdAt: new Date().toISOString() },
      { title: 'Plan weekly macros and workout schedule', status: 'TODO', priority: 'LOW', category: 'Health', dueDate: daysAgo(-1), createdAt: new Date().toISOString() },
      { title: 'Draft LinkedIn article on hydrocolloid blending optimizations', status: 'TODO', priority: 'MEDIUM', category: 'Content', dueDate: daysAgo(-6), createdAt: new Date().toISOString() },
      { title: 'Follow up with Amul Dairy procurement team', status: 'TODO', priority: 'HIGH', category: 'Business', dueDate: daysAgo(-2), createdAt: new Date().toISOString() },
      { title: 'Complete FSSAI mock test - Food Safety Regulations', status: 'DONE', priority: 'HIGH', category: 'Government Exams', dueDate: daysAgo(1), createdAt: new Date().toISOString() },
      { title: 'Write research abstract for carrageenan gel systems', status: 'IN_PROGRESS', priority: 'MEDIUM', category: 'Research', dueDate: daysAgo(-10), createdAt: new Date().toISOString() },
    ]);
  }

  // ── 2. Goals ──────────────────────────────────────────────────────────────
  if ((await db.goals.count()) === 0) {
    await db.goals.bulkAdd([
      { title: 'Establish KAFS as India\'s primary hydrocolloid stabilizer blend house', description: 'Cross ₹100Cr in revenue and setup blending manufacturing plant.', progress: 15, dueDate: '2036-12-31', category: '10 Year', horizon: '10 Year', createdAt: new Date().toISOString() },
      { title: 'Build high-care blending plant facility', description: 'Set up manufacturing and compliance lines for proprietary Carrageenan blends.', progress: 20, dueDate: '2031-06-30', category: '5 Year', horizon: '5 Year', createdAt: new Date().toISOString() },
      { title: 'Complete PhD in Food Technology', description: 'Target IIT or NIFTEM. Specialisation in hydrocolloid rheology systems.', progress: 30, dueDate: '2030-06-30', category: '5 Year', horizon: '5 Year', createdAt: new Date().toISOString() },
      { title: 'Acquire FSSAI and ISO certifications for plant formulations', description: 'Ensure full regulatory approval on all commercial stabilizers.', progress: 40, dueDate: '2026-12-31', category: 'Annual', horizon: 'Annual', createdAt: new Date().toISOString() },
      { title: 'Qualify B2B pipeline worth ₹50 Lakhs in dairy sector', description: 'Add and test samples with 10 high-value processing plants.', progress: 60, dueDate: '2026-09-30', category: 'Quarterly', horizon: 'Quarterly', createdAt: new Date().toISOString() },
      { title: 'Publish first research paper on seaweed hydrocolloids', description: 'Target journal: Food Chemistry or LWT Food Science & Technology.', progress: 25, dueDate: '2026-12-31', category: 'Annual', horizon: 'Annual', createdAt: new Date().toISOString() },
      { title: 'Finalize formulation specifications for ice cream blends', description: 'Complete dry-run mixing viscosity test reports.', progress: 85, dueDate: '2026-06-30', category: 'Monthly', horizon: 'Monthly', createdAt: new Date().toISOString() },
      { title: 'Build LinkedIn brand with 5000 followers', description: 'Post 3 technical hydrocolloid insights per week.', progress: 18, dueDate: '2026-12-31', category: 'Annual', horizon: 'Annual', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 3. CRM Leads ──────────────────────────────────────────────────────────
  if ((await db.leads.count()) === 0) {
    await db.leads.bulkAdd([
      { companyName: 'Heritage Foods Ltd', company: 'Heritage Foods Ltd', contactPerson: 'Dr. Ramesh Kumar', contact: 'Dr. Ramesh Kumar', phone: '+91 98765 43210', email: 'ramesh.k@heritage.com', productInterest: 'Kappa Carrageenan', status: 'Trial', stage: 'TRIAL', notes: 'Testing customized stabilizer batch to reduce syneresis in ice cream.', nextFollowUp: daysAgo(-3), opportunityValue: 250000, industry: 'Dairy', createdAt: new Date().toISOString() },
      { companyName: 'Kwality Confectionery', company: 'Kwality Confectionery', contactPerson: 'Anil Mehta', contact: 'Anil Mehta', email: 'mehta.anil@kwality.in', productInterest: 'Iota Carrageenan', status: 'Sample Sent', stage: 'SAMPLE_SENT', notes: 'Gummy candy prototype stabilizers matching pectin alternative requirements.', nextFollowUp: daysAgo(-6), opportunityValue: 120000, industry: 'Confectionery', createdAt: new Date().toISOString() },
      { companyName: 'Amul Dairy Co-op', company: 'Amul Dairy Co-op', contactPerson: 'Sanjay Shah', contact: 'Sanjay Shah', status: 'Lead', stage: 'NEW', notes: 'Initial outreach regarding high-viscosity thickeners for yogurt stabilizer formulations.', nextFollowUp: daysAgo(-1), opportunityValue: 500000, industry: 'Dairy', createdAt: new Date().toISOString() },
      { companyName: 'ITC Foods Division', company: 'ITC Foods Division', contactPerson: 'Priya Nair', contact: 'Priya Nair', email: 'p.nair@itcfoods.in', productInterest: 'Lambda Carrageenan', status: 'Contacted', stage: 'CONTACTED', notes: 'Interested in cold-soluble carrageenan for instant dessert powder premixes.', nextFollowUp: daysAgo(-4), opportunityValue: 380000, industry: 'Food Processing', createdAt: new Date().toISOString() },
      { companyName: 'Vadilal Industries', company: 'Vadilal Industries', contactPerson: 'Dinesh Patel', contact: 'Dinesh Patel', status: 'Qualified', stage: 'QUALIFIED', notes: 'Qualified for high-volume ice cream stabilizer trial. 500kg/month potential.', nextFollowUp: daysAgo(-2), opportunityValue: 720000, industry: 'Ice Cream', createdAt: new Date().toISOString() },
      { companyName: 'Mother Dairy', company: 'Mother Dairy', contactPerson: 'Rajiv Sharma', contact: 'Rajiv Sharma', status: 'Proposal', stage: 'PROPOSAL', notes: 'Submitted technical proposal for low-fat yogurt stabilizer system.', nextFollowUp: daysAgo(-7), opportunityValue: 900000, industry: 'Dairy', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 4. Health Logs (30 days) ──────────────────────────────────────────────
  if ((await db.healthLogs.count()) === 0) {
    const logs = [];
    for (let i = 29; i >= 0; i--) {
      const energyVal = Math.min(10, Math.max(4, 7 + Math.round(Math.sin(i * 0.7) * 2)));
      const sleepVal  = +(Math.min(9, Math.max(5, 6.8 + Math.sin(i * 0.5) * 1.2)).toFixed(1));
      logs.push({
        date: daysAgo(i),
        weight: +(76.5 - i * 0.05 + Math.sin(i) * 0.3).toFixed(1),
        sleep: sleepVal,
        sleepHours: sleepVal,
        sleepQuality: Math.round(sleepVal),
        waterIntake: 2600 + (i % 4) * 200,
        exercise: Math.max(0, 35 + Math.round(Math.sin(i * 1.3) * 20)),
        energy: energyVal,
        energyLevel: energyVal,
        createdAt: new Date().toISOString(),
      });
    }
    await db.healthLogs.bulkAdd(logs);
  }

  // ── 5. Research Papers ────────────────────────────────────────────────────
  if ((await db.researchPapers.count()) === 0) {
    await db.researchPapers.bulkAdd([
      { title: 'Viscosity and gelation synergy of carrageenan-locust bean gum blends', topic: 'Carrageenan Rheology', status: 'Completed', summary: 'Outlines details regarding optimal blending ratio parameters to maximize texture strength.', createdAt: new Date().toISOString() },
      { title: 'Thermal degradation indexes in semi-refined seaweed extracts', topic: 'Carrageenan Manufacturing', status: 'In Progress', summary: 'Assessing hot-alkali treatment thermal profile limits.', createdAt: new Date().toISOString() },
      { title: 'Cold-soluble carrageenan applications in low-fat dairy', topic: 'Food Technology', status: 'Planned', summary: 'Literature review on cold-gelling k-carrageenan blends for yogurt stabilization.', createdAt: new Date().toISOString() },
      { title: 'Patent landscape of hydrocolloid blending in India 2015-2025', topic: 'Patents Analysis', status: 'Completed', summary: 'Analysis of 47 filed patents in Indian hydrocolloid space.', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 6. Exams ──────────────────────────────────────────────────────────────
  if ((await db.exams.count()) === 0) {
    await db.exams.bulkAdd([
      { name: 'FSSAI Technical Officer Exam', applicationDate: '2026-05-15', examDate: '2026-08-20', status: 'Active', notes: 'Focus study areas: food safety regulations, testing standards, FSSAI Acts.', studyHours: 85, createdAt: new Date().toISOString() },
      { name: 'ICAR Agricultural Research Service (ARS)', applicationDate: '2026-07-01', examDate: '2026-10-15', status: 'Planned', notes: 'Focus: agricultural post-harvest technology and food processing rules.', studyHours: 40, createdAt: new Date().toISOString() },
      { name: 'NIFTEM Junior Research Fellowship', applicationDate: '2026-06-01', examDate: '2026-09-10', status: 'Active', notes: 'Food Science & Technology track. Emphasis on functional foods and hydrocolloids.', studyHours: 55, createdAt: new Date().toISOString() },
    ]);
  }

  // ── 7. Knowledge Base ─────────────────────────────────────────────────────
  if ((await db.knowledgeNotes.count()) === 0) {
    await db.knowledgeNotes.bulkAdd([
      { title: 'Kappa vs Iota gelation patterns', content: 'Kappa forms rigid and brittle gel with potassium ions. Iota forms elastic and cohesive gel with calcium ions. Lambda does not gel — it acts as thickener only.', tags: ['carrageenan', 'gel strength', 'rheology'], category: 'Research', createdAt: new Date().toISOString() },
      { title: 'B2B Objection handling for stabilizer pricing', content: 'Emphasize cost-in-use benefits: stabilizer constitutes only 0.2% of formulation while reducing product wastage by 15%. ROI > 40x on ingredient cost.', tags: ['sales', 'crm', 'objection'], category: 'Business Knowledge', createdAt: new Date().toISOString() },
      { title: 'FSSAI Schedule 5 — Permitted Food Additives', content: 'Key stabilizers permitted: Carrageenan (INS 407), Locust Bean Gum (INS 410), Guar Gum (INS 412), Xanthan Gum (INS 415). Max usage levels vary by product category.', tags: ['fssai', 'regulation', 'exams'], category: 'Government Exams', createdAt: new Date().toISOString() },
      { title: 'PhD Shortlist: IIT & NIFTEM Advisors', content: 'Dr. V. Prasad (NIFTEM) - Carrageenan gels. Prof. Anuradha Datta (BITS) - Biopolymer texture. Dr. Kapoor (IIT Bombay) - Emulsion systems. Target application window: July 2026.', tags: ['phd', 'career', 'research'], category: 'Career', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 8. Documents ──────────────────────────────────────────────────────────
  if ((await db.documents.count()) === 0) {
    await db.documents.bulkAdd([
      { fileName: 'Stabilizer_Spec_Sheet_V1.pdf', fileUrl: '#', fileType: 'pdf', uploadedAt: new Date().toISOString() },
      { fileName: 'Lead_Outreach_List.xlsx', fileUrl: '#', fileType: 'xlsx', uploadedAt: new Date().toISOString() },
      { fileName: 'FSSAI_Notification_2026.pdf', fileUrl: '#', fileType: 'pdf', uploadedAt: new Date().toISOString() },
    ]);
  }

  // ── 9. Daily Reviews ──────────────────────────────────────────────────────
  if ((await db.dailyReviews.count()) === 0) {
    await db.dailyReviews.bulkAdd([
      { date: daysAgo(1), energyMorning: 8, priorities: ['Run Kappa formulations viscosity test', 'Call Heritage Foods', 'Complete FSSAI mock paper'], wins: ['Dr. Ramesh Kumar accepted prototype sample', 'Finished carrageenan ratio experiments'], challenges: ['Lab heating block temp fluctuated'], learnings: ['Calibrate temperature logs hourly for consistency'], createdAt: new Date().toISOString() },
      { date: daysAgo(2), energyMorning: 7, priorities: ['Prepare Amul pitch deck', 'Study FSSAI food additives chapter'], wins: ['Amul procurement team replied positively'], challenges: ['Raw seaweed moisture content higher than expected'], learnings: ['Always pre-dry feedstock 2h before processing'], createdAt: new Date().toISOString() },
      { date: daysAgo(3), energyMorning: 9, priorities: ['LinkedIn post on gel strength optimization'], wins: ['Article received 340 impressions'], challenges: ['Writing took 2x longer than planned'], learnings: ['Use voice notes first, then edit — faster flow'], createdAt: new Date().toISOString() },
    ]);
  }

  // ── 10. Projects ──────────────────────────────────────────────────────────
  if ((await db.projects.count()) === 0) {
    await db.projects.bulkAdd([
      { title: 'Kappa formulations mix optimization', name: 'Kappa formulations mix optimization', objective: 'Find optimal ratio of Kappa Carrageenan and Locust Bean Gum to maximize viscosity.', description: 'Find optimal ratio of Kappa Carrageenan and Locust Bean Gum to maximize viscosity.', status: 'ACTIVE', priority: 'HIGH', progress: 45, category: 'Research', createdAt: new Date().toISOString() },
      { title: 'FSSAI compliance approval preparation', name: 'FSSAI compliance approval preparation', objective: 'Collect and file all documentation for regulatory formulation review.', description: 'Collect and file all documentation for regulatory formulation review.', status: 'PLANNING', priority: 'MEDIUM', progress: 20, category: 'Government Exams', createdAt: new Date().toISOString() },
      { title: 'KAFS Brand & LinkedIn Growth Sprint', name: 'KAFS Brand & LinkedIn Growth Sprint', objective: 'Grow LinkedIn presence to 5000 followers via weekly technical content.', description: 'Consistent content about food science, hydrocolloid systems, and KAFS products.', status: 'ACTIVE', priority: 'MEDIUM', progress: 18, category: 'Business', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 11. Habits ────────────────────────────────────────────────────────────
  if ((await db.habits.count()) === 0) {
    const todayStr = daysAgo(0);
    const yStr     = daysAgo(1);
    await db.habits.bulkAdd([
      { name: 'Drink 3L Water', isActive: true, completedDates: [todayStr, yStr, daysAgo(2)], createdAt: new Date().toISOString() },
      { name: '45 mins Study / Revision', isActive: true, completedDates: [yStr, daysAgo(2), daysAgo(3)], createdAt: new Date().toISOString() },
      { name: 'Cardio Workout', isActive: true, completedDates: [todayStr, daysAgo(2), daysAgo(4)], createdAt: new Date().toISOString() },
      { name: 'Read 20 pages (Research / Business)', isActive: true, completedDates: [todayStr, yStr], createdAt: new Date().toISOString() },
      { name: 'Cold shower / Morning reset', isActive: true, completedDates: [todayStr], createdAt: new Date().toISOString() },
    ]);
  }

  // ── 12. Skills ────────────────────────────────────────────────────────────
  if ((await db.skills.count()) === 0) {
    await db.skills.bulkAdd([
      { name: 'Food Formulation & Gelation', level: 8, category: 'Food Technology', createdAt: new Date().toISOString() },
      { name: 'Seaweed Hydrocolloids Sourcing', level: 7, category: 'Manufacturing', createdAt: new Date().toISOString() },
      { name: 'B2B Technical Sales', level: 6, category: 'Sales', createdAt: new Date().toISOString() },
      { name: 'Rheology & Viscometry', level: 8, category: 'Food Technology', createdAt: new Date().toISOString() },
      { name: 'FSSAI Food Law', level: 5, category: 'Regulatory', createdAt: new Date().toISOString() },
      { name: 'Python / Data Analysis', level: 4, category: 'Technology', createdAt: new Date().toISOString() },
      { name: 'Research Paper Writing', level: 6, category: 'Academia', createdAt: new Date().toISOString() },
      { name: 'LinkedIn Content Strategy', level: 5, category: 'Brand', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 13. Products ──────────────────────────────────────────────────────────
  if ((await db.products.count()) === 0) {
    await db.products.bulkAdd([
      { name: 'Kappa-Carrageenan Ice Cream Blend KB-20', category: 'HYDROCOLLOIDS', isActive: true, createdAt: new Date().toISOString() },
      { name: 'Iota-Carrageenan Gummy Blend IB-05', category: 'CARRAGEENAN', isActive: true, createdAt: new Date().toISOString() },
      { name: 'Locust Bean Gum Cold-Soluble Grade LB-10', category: 'HYDROCOLLOIDS', isActive: true, createdAt: new Date().toISOString() },
    ]);
  }

  // ── 14. Suppliers ─────────────────────────────────────────────────────────
  if ((await db.suppliers.count()) === 0) {
    await db.suppliers.bulkAdd([
      { name: 'Oceanic Seaweed Extracts Ltd', contactPerson: 'M. Pillai', email: 'pillai@oceanic.in', createdAt: new Date().toISOString() },
      { name: 'Global Thickener Trading Corp', contactPerson: 'Sarah Chen', email: 'schen@globalthickener.com', createdAt: new Date().toISOString() },
      { name: 'Marinalg International', contactPerson: 'Pierre Dubois', email: 'p.dubois@marinalg.fr', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 15. Transactions (3 months of realistic data) ─────────────────────────
  if ((await db.transactions.count()) === 0) {
    const txRows = [];

    // Month -2
    txRows.push(
      { date: daysAgo(58), amount: 120000, type: 'INCOME'    as const, category: 'Consulting', description: 'Food tech advisory — startup retainer', createdAt: new Date().toISOString() },
      { date: daysAgo(55), amount: 32000,  type: 'EXPENSE'   as const, category: 'Lab Supplies', description: 'Carrageenan raw material purchase', createdAt: new Date().toISOString() },
      { date: daysAgo(52), amount: 18000,  type: 'EXPENSE'   as const, category: 'Marketing', description: 'LinkedIn Premium + ads', createdAt: new Date().toISOString() },
      { date: daysAgo(50), amount: 85000,  type: 'INCOME'    as const, category: 'Product Sales', description: 'KB-20 blend — Heritage Foods first order', createdAt: new Date().toISOString() },
      { date: daysAgo(48), amount: 50000,  type: 'INVESTMENT' as const, category: 'CapEx', description: 'Lab viscometer calibration upgrade', createdAt: new Date().toISOString() },
      { date: daysAgo(45), amount: 12000,  type: 'EXPENSE'   as const, category: 'Travel', description: 'Client visit — Mumbai', createdAt: new Date().toISOString() },
    );

    // Month -1
    txRows.push(
      { date: daysAgo(35), amount: 150000, type: 'INCOME'    as const, category: 'Consulting', description: 'FSSAI formulations advisory retainer fee', createdAt: new Date().toISOString() },
      { date: daysAgo(32), amount: 45000,  type: 'EXPENSE'   as const, category: 'Seaweed Sourcing', description: 'Seaweed feedstock prototype freight charges', createdAt: new Date().toISOString() },
      { date: daysAgo(28), amount: 96000,  type: 'INCOME'    as const, category: 'Product Sales', description: 'IB-05 gummy blend — Kwality order 2', createdAt: new Date().toISOString() },
      { date: daysAgo(25), amount: 22000,  type: 'EXPENSE'   as const, category: 'Office', description: 'Lab rent + utilities', createdAt: new Date().toISOString() },
      { date: daysAgo(20), amount: 100000, type: 'INVESTMENT' as const, category: 'CapEx', description: 'Lab heating block unit purchase', createdAt: new Date().toISOString() },
      { date: daysAgo(18), amount: 8000,   type: 'EXPENSE'   as const, category: 'SaaS Tools', description: 'Software subscriptions', createdAt: new Date().toISOString() },
      { date: daysAgo(15), amount: 60000,  type: 'INCOME'    as const, category: 'Training', description: 'Food Tech workshop — attendee fees', createdAt: new Date().toISOString() },
    );

    // This month
    txRows.push(
      { date: daysAgo(10), amount: 180000, type: 'INCOME'    as const, category: 'Consulting', description: 'Q2 retainer — dairy stabilizer R&D', createdAt: new Date().toISOString() },
      { date: daysAgo(8),  amount: 38000,  type: 'EXPENSE'   as const, category: 'Lab Supplies', description: 'Locust bean gum grade LB-10 raw material', createdAt: new Date().toISOString() },
      { date: daysAgo(6),  amount: 120000, type: 'INCOME'    as const, category: 'Product Sales', description: 'KB-20 second shipment — Vadilal', createdAt: new Date().toISOString() },
      { date: daysAgo(4),  amount: 15000,  type: 'EXPENSE'   as const, category: 'Professional Dev', description: 'NIFTEM workshop registration fee', createdAt: new Date().toISOString() },
      { date: daysAgo(2),  amount: 45000,  type: 'EXPENSE'   as const, category: 'Office', description: 'Q2 lab equipment maintenance', createdAt: new Date().toISOString() },
      { date: daysAgo(1),  amount: 75000,  type: 'INCOME'    as const, category: 'Product Sales', description: 'Mother Dairy — sample approval payment', createdAt: new Date().toISOString() },
    );

    await db.transactions.bulkAdd(txRows);
  }

  // ── 16. Contacts ──────────────────────────────────────────────────────────
  if ((await db.contacts.count()) === 0) {
    await db.contacts.bulkAdd([
      { name: 'Dr. Ramesh Kumar', role: 'Mentors', email: 'ramesh.k@heritage.com', phone: '+91 98765 43210', interactionScore: 90, lastContact: daysAgo(1), notes: 'R&D Director at Heritage Foods. Advising on Carrageenan blend trials.', createdAt: new Date().toISOString() },
      { name: 'Dr. V. Prasad', role: 'Experts', email: 'vprasad@niftem.ac.in', interactionScore: 82, lastContact: daysAgo(12), notes: 'NIFTEM Food Tech professor. Potential PhD advisor for hydrocolloid research.', createdAt: new Date().toISOString() },
      { name: 'Sanjay Shah', role: 'Customers', email: 'sshah@amul.coop', phone: '+91 87654 32109', interactionScore: 74, lastContact: daysAgo(3), notes: 'Procurement Head at Amul Dairy. Currently evaluating our yogurt stabilizer system.', createdAt: new Date().toISOString() },
      { name: 'Sarah Jenkins', role: 'Recruiters', email: 'sjenkins@itc-recruitment.co.in', interactionScore: 55, lastContact: daysAgo(18), notes: 'Outreached regarding Senior Food Technologist opening at ITC.', createdAt: new Date().toISOString() },
      { name: 'Priya Nair', role: 'Customers', email: 'p.nair@itcfoods.in', interactionScore: 68, lastContact: daysAgo(7), notes: 'ITC Foods product developer. Interested in cold-soluble carrageenan grade.', createdAt: new Date().toISOString() },
      { name: 'Anil Mehta', role: 'Customers', email: 'mehta.anil@kwality.in', interactionScore: 79, lastContact: daysAgo(4), notes: 'QC Manager at Kwality Confectionery. Running IB-05 blend gummy trials.', createdAt: new Date().toISOString() },
      { name: 'Prof. S. Krishnaswamy', role: 'Advisors', email: 'skrishna@iitb.ac.in', interactionScore: 60, lastContact: daysAgo(22), notes: 'IIT Bombay emulsion systems faculty. Potential collaborative research opportunity.', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 17. Opportunities ─────────────────────────────────────────────────────
  if ((await db.opportunities.count()) === 0) {
    await db.opportunities.bulkAdd([
      { title: 'DBT Hydrocolloid R&D Grant', source: 'Grants', roiScore: 88, revenueImpact: 1200000, alignmentScore: 95, effortScore: 40, notes: 'Department of Biotechnology R&D assistance. Application open July 2026.', createdAt: new Date().toISOString() },
      { title: 'Kwality Foods Stabilizer Supply Contract', source: 'Customers', roiScore: 78, revenueImpact: 4500000, alignmentScore: 85, effortScore: 65, notes: 'Targeting 2 Tons per month stabilizer sourcing agreement.', createdAt: new Date().toISOString() },
      { title: 'ITC Foods Carrageenan Premix Partnership', source: 'Partnerships', roiScore: 82, revenueImpact: 3200000, alignmentScore: 90, effortScore: 55, notes: 'Co-develop cold-soluble carrageenan grades for ITC instant food premixes.', createdAt: new Date().toISOString() },
      { title: 'Export to Southeast Asia via Marinalg', source: 'Export', roiScore: 70, revenueImpact: 8000000, alignmentScore: 72, effortScore: 80, notes: 'Marinalg distribution partner in Thailand/Vietnam for KAFS blended grades.', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 18. Time Allocations (28 days) ───────────────────────────────────────
  if ((await db.timeAllocations.count()) === 0) {
    const categories = ['Business', 'Research', 'Exams', 'Health', 'Career', 'Brand'] as const;
    const planned: Record<string, number> = { Business: 6, Research: 3, Exams: 4, Health: 1.5, Career: 1, Brand: 1 };
    const rows: Array<{ date: string; category: typeof categories[number]; hoursPlanned: number; hoursActual: number; createdAt: string }> = [];

    for (let i = 27; i >= 0; i--) {
      const dateStr = daysAgo(i);
      categories.forEach(cat => {
        const base = planned[cat];
        const noise = Math.sin(i * 0.8 + cat.length) * 0.8 + (i % 3 === 0 ? -0.5 : 0.3);
        rows.push({
          date: dateStr,
          category: cat,
          hoursPlanned: base,
          hoursActual: Math.max(0, +(base + noise).toFixed(1)),
          createdAt: new Date().toISOString(),
        });
      });
    }
    await db.timeAllocations.bulkAdd(rows);
  }

  // ── 19. Formulations (KAFS core data) ────────────────────────────────────
  if ((await db.formulations.count()) === 0) {
    const now = new Date().toISOString();
    await db.formulations.bulkAdd([
      {
        name: 'Ice Cream Stabilizer Blend KB-20',
        description: 'Kappa-Carrageenan + Locust Bean Gum optimized blend for reduced-fat ice cream. Minimizes syneresis and improves melt resistance.',
        version: '2.0',
        ingredientsList: JSON.stringify([
          { name: 'Kappa Carrageenan', pct: 0.025, cost: 450 },
          { name: 'Locust Bean Gum', pct: 0.05, cost: 320 },
          { name: 'Guar Gum', pct: 0.015, cost: 180 },
        ]),
        targetApplication: 'Ice Cream / Frozen Desserts',
        processingNotes: 'Disperse in cold water at 5°C, heat to 70°C while stirring. Allow 20 min hydration before mixing into base.',
        results: JSON.stringify({ gelStrength: 320, viscosity: '5800 cP', syneresis: '< 2%', meltResistance: 'Excellent' }),
        status: 'Active',
        costPerKg: 38.5,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Yogurt Stabilizer YS-10',
        description: 'Low-fat yogurt stabilizer with smooth mouthfeel. Target: set-style fermented dairy without post-process syneresis.',
        version: '1.3',
        ingredientsList: JSON.stringify([
          { name: 'Iota Carrageenan', pct: 0.02, cost: 480 },
          { name: 'Modified Starch', pct: 0.08, cost: 95 },
          { name: 'Pectin HM', pct: 0.01, cost: 600 },
        ]),
        targetApplication: 'Set Yogurt / Fermented Dairy',
        processingNotes: 'Pre-hydrate in cold milk, pasteurize at 85°C/15s. Inoculate at 42°C.',
        results: JSON.stringify({ gelStrength: 180, viscosity: '8200 cP', syneresis: '< 1%', texture: 'Smooth, cohesive' }),
        status: 'Active',
        costPerKg: 52.2,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Gummy Candy Matrix GC-05',
        description: 'Iota-Carrageenan + Gelatin hybrid for elastic gummy candy. Vegan-compatible option under development.',
        version: '0.8',
        ingredientsList: JSON.stringify([
          { name: 'Iota Carrageenan', pct: 0.04, cost: 480 },
          { name: 'Gelatin (fish)', pct: 0.06, cost: 220 },
          { name: 'Sucrose', pct: 0.55, cost: 45 },
          { name: 'Glucose Syrup', pct: 0.35, cost: 55 },
        ]),
        targetApplication: 'Confectionery / Gummy Candy',
        processingNotes: 'Dissolve sugars at 105°C, add hydrocolloids at 85°C. Cast at 70°C. Demould after 24h at 15°C.',
        status: 'Draft',
        costPerKg: 121.0,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Meat Binder MB-03',
        description: 'Lambda Carrageenan-based meat binder for processed meat products. Targets water binding and slice stability.',
        version: '1.0',
        ingredientsList: JSON.stringify([
          { name: 'Lambda Carrageenan', pct: 0.03, cost: 520 },
          { name: 'Sodium Phosphate', pct: 0.015, cost: 90 },
          { name: 'Salt', pct: 0.02, cost: 10 },
        ]),
        targetApplication: 'Processed Meat / Restructured Meat',
        status: 'Archived',
        costPerKg: 18.2,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Instant Dessert Mix ID-01',
        description: 'Cold-soluble Kappa Carrageenan blend for instant pudding and dessert powders. Reconstitutes in cold water within 60s.',
        version: '1.1',
        ingredientsList: JSON.stringify([
          { name: 'Cold-Soluble Kappa Carrageenan', pct: 0.015, cost: 680 },
          { name: 'Modified Tapioca Starch', pct: 0.12, cost: 85 },
          { name: 'Sodium Caseinate', pct: 0.04, cost: 310 },
        ]),
        targetApplication: 'Instant Desserts / Powdered Foods',
        processingNotes: 'Dry-blend all components. Bag in moisture-proof 25kg multi-wall paper bags.',
        status: 'Active',
        costPerKg: 44.8,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  // ── 20. Ingredients (KAFS raw material database) ──────────────────────────
  if ((await db.ingredients.count()) === 0) {
    const now = new Date().toISOString();
    await db.ingredients.bulkAdd([
      { name: 'Kappa Carrageenan', category: 'Hydrocolloid', type: 'Seaweed Extract', costPerKg: 450, description: 'Strong rigid gel with K+ ions. Primarily from Kappaphycus alvarezii.', properties: JSON.stringify({ gelType: 'Rigid', ionSensitive: 'K+', usage: '0.01–0.05%', solubility: 'Hot' }), regulatoryStatus: 'GRAS, INS 407', createdAt: now },
      { name: 'Iota Carrageenan', category: 'Hydrocolloid', type: 'Seaweed Extract', costPerKg: 480, description: 'Elastic thixotropic gel with Ca2+ ions. Excellent freeze-thaw stability.', properties: JSON.stringify({ gelType: 'Elastic', ionSensitive: 'Ca2+', usage: '0.01–0.04%', solubility: 'Hot' }), regulatoryStatus: 'GRAS, INS 407', createdAt: now },
      { name: 'Lambda Carrageenan', category: 'Hydrocolloid', type: 'Seaweed Extract', costPerKg: 520, description: 'Non-gelling, cold-soluble thickener. Used for creamy textures.', properties: JSON.stringify({ gelType: 'None', ionSensitive: 'None', usage: '0.01–0.04%', solubility: 'Cold' }), regulatoryStatus: 'GRAS, INS 407', createdAt: now },
      { name: 'Locust Bean Gum', category: 'Hydrocolloid', type: 'Seed Gum', costPerKg: 320, description: 'Galactomannan synergist. Enhances kappa gel strength and reduces syneresis.', properties: JSON.stringify({ synergy: 'Kappa, Xanthan', usage: '0.02–0.1%', solubility: 'Hot' }), regulatoryStatus: 'GRAS, INS 410', createdAt: now },
      { name: 'Guar Gum', category: 'Hydrocolloid', type: 'Seed Gum', costPerKg: 180, description: 'High-viscosity, cold-soluble galactomannan. Widely used in ice cream and sauces.', properties: JSON.stringify({ usage: '0.01–0.05%', solubility: 'Cold', viscosity: 'High' }), regulatoryStatus: 'GRAS, INS 412', createdAt: now },
      { name: 'Xanthan Gum', category: 'Hydrocolloid', type: 'Microbial', costPerKg: 290, description: 'Microbially-derived polysaccharide. Excellent thickener and stabilizer in acidic systems.', properties: JSON.stringify({ usage: '0.01–0.05%', solubility: 'Cold', shearThinning: true }), regulatoryStatus: 'GRAS, INS 415', createdAt: now },
      { name: 'Pectin HM', category: 'Hydrocolloid', type: 'Plant Extract', costPerKg: 600, description: 'High-methoxyl pectin. Gels in high-sugar, acidic conditions. Used in jams and jellies.', properties: JSON.stringify({ gelCondition: 'pH < 3.5, Sugar > 55%', usage: '0.3–0.8%', solubility: 'Hot' }), regulatoryStatus: 'GRAS, INS 440', createdAt: now },
      { name: 'Modified Starch E1422', category: 'Starch', type: 'Modified Starch', costPerKg: 95, description: 'Acetylated distarch adipate. Freeze-thaw stable thickener for sauces and soups.', properties: JSON.stringify({ usage: '2–8%', solubility: 'Hot', freezeThaw: 'Stable' }), regulatoryStatus: 'INS 1422', createdAt: now },
    ]);
  }

  // ── 21. Batch Records ─────────────────────────────────────────────────────
  if ((await db.batchRecords.count()) === 0) {
    const daysAgo = (n: number) => {
      const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0];
    };
    await db.batchRecords.bulkAdd([
      { batchId: 'KB20-2026-001', productName: 'Ice Cream Stabilizer KB-20', targetWeight: 50, actualWeight: 48.8, yield: 97.6, status: 'Completed', startDate: daysAgo(15), endDate: daysAgo(14), notes: 'First full production run. Minor yield loss due to moisture in raw kappa batch.', qcPassed: true, createdAt: new Date().toISOString() },
      { batchId: 'YS10-2026-002', productName: 'Yogurt Stabilizer YS-10', targetWeight: 25, actualWeight: 24.5, yield: 98.0, status: 'Completed', startDate: daysAgo(10), endDate: daysAgo(9), notes: 'Smooth run. Iota hydration temp held at 72°C — improved dispersion.', qcPassed: true, createdAt: new Date().toISOString() },
      { batchId: 'KB20-2026-003', productName: 'Ice Cream Stabilizer KB-20', targetWeight: 100, status: 'In Progress', startDate: daysAgo(2), notes: 'Heritage Foods order. Scale-up to 100kg. Monitor viscosity at each 25kg increment.', createdAt: new Date().toISOString() },
      { batchId: 'ID01-2026-004', productName: 'Instant Dessert Mix ID-01', targetWeight: 30, status: 'Planned', startDate: daysAgo(-5), notes: 'ITC Foods trial batch. Cold-soluble grade sourced from Marinalg.', createdAt: new Date().toISOString() },
    ]);
  }

  // ── 22. Study Sessions (Exam OS) ──────────────────────────────────────────
  if ((await db.studySessions.count()) === 0) {
    const daysAgo = (n: number) => {
      const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0];
    };
    await db.studySessions.bulkAdd([
      { subject: 'Food Safety Law', topic: 'FSSAI Act 2006 — Part I & II', durationMinutes: 90, date: daysAgo(1), notes: 'Covered definitions, licensing, and penalty provisions.', createdAt: new Date().toISOString() },
      { subject: 'Food Microbiology', topic: 'Pathogen control and HACCP principles', durationMinutes: 60, date: daysAgo(2), notes: 'Key organisms: Listeria monocytogenes, Salmonella spp., E. coli O157:H7.', createdAt: new Date().toISOString() },
      { subject: 'Food Chemistry', topic: 'Protein functionality — emulsification and gelation', durationMinutes: 75, date: daysAgo(3), notes: 'Focus on casein micelle structure and heat-induced gelation.', createdAt: new Date().toISOString() },
      { subject: 'Food Safety Law', topic: 'FSSAI Standards — Additives Schedule V', durationMinutes: 45, date: daysAgo(4), notes: 'Memorized INS numbers for key hydrocolloids: 407, 410, 412, 415.', createdAt: new Date().toISOString() },
      { subject: 'Agricultural Science', topic: 'Post-harvest physiology — respiration and ethylene', durationMinutes: 60, date: daysAgo(5), notes: 'ICAR exam focus: climacteric vs non-climacteric fruits and cold chain.', createdAt: new Date().toISOString() },
      { subject: 'Food Processing Technology', topic: 'Thermal processing — D and Z values', durationMinutes: 90, date: daysAgo(6), notes: 'Calculations and NIFTEM past paper practice.', createdAt: new Date().toISOString() },
      { subject: 'Food Safety Law', topic: 'Mock test review — FSSAI regulations', durationMinutes: 120, date: daysAgo(8), createdAt: new Date().toISOString() },
      { subject: 'Food Chemistry', topic: 'Lipid oxidation mechanisms and antioxidants', durationMinutes: 60, date: daysAgo(10), createdAt: new Date().toISOString() },
    ]);
  }

  // ── 23. Study Topics ──────────────────────────────────────────────────────
  if ((await db.studyTopics.count()) === 0) {
    const now = new Date().toISOString();
    const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
    await db.studyTopics.bulkAdd([
      { name: 'FSSAI Act 2006 & Amendments', subject: 'Food Safety Law', status: 'Completed', importance: 3, lastRevised: daysAgo(1), nextRevision: daysAgo(-7), createdAt: now },
      { name: 'Schedule V — Food Additives & INS Numbers', subject: 'Food Safety Law', status: 'In Progress', importance: 3, lastRevised: daysAgo(4), createdAt: now },
      { name: 'HACCP Principles & CCPs', subject: 'Food Microbiology', status: 'Completed', importance: 3, lastRevised: daysAgo(2), nextRevision: daysAgo(-14), createdAt: now },
      { name: 'Thermal Processing — D, Z, F values', subject: 'Food Processing Technology', status: 'In Progress', importance: 3, lastRevised: daysAgo(6), createdAt: now },
      { name: 'Protein Gelation & Emulsification', subject: 'Food Chemistry', status: 'In Progress', importance: 2, lastRevised: daysAgo(3), createdAt: now },
      { name: 'Lipid Oxidation & Antioxidants', subject: 'Food Chemistry', status: 'Completed', importance: 2, lastRevised: daysAgo(10), createdAt: now },
      { name: 'Post-Harvest Physiology', subject: 'Agricultural Science', status: 'In Progress', importance: 2, lastRevised: daysAgo(5), createdAt: now },
      { name: 'Good Manufacturing Practices (GMP)', subject: 'Food Safety Law', status: 'Not Started', importance: 3, createdAt: now },
      { name: 'Rheology of Food Systems', subject: 'Food Chemistry', status: 'Not Started', importance: 2, createdAt: now },
      { name: 'Packaging Materials & Food Safety', subject: 'Food Processing Technology', status: 'Not Started', importance: 1, createdAt: now },
    ]);
  }

  // ── 24. Mock Tests ────────────────────────────────────────────────────────
  if ((await db.mockTests.count()) === 0) {
    const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
    await db.mockTests.bulkAdd([
      { title: 'FSSAI Full Mock — Series 1', subject: 'Food Safety Law', totalQuestions: 100, correctAnswers: 68, timeTaken: 105, dateTaken: daysAgo(8), createdAt: new Date().toISOString() },
      { title: 'Food Chemistry Quick Test', subject: 'Food Chemistry', totalQuestions: 50, correctAnswers: 38, timeTaken: 55, dateTaken: daysAgo(10), createdAt: new Date().toISOString() },
      { title: 'FSSAI Full Mock — Series 2', subject: 'Food Safety Law', totalQuestions: 100, correctAnswers: 74, timeTaken: 98, dateTaken: daysAgo(3), createdAt: new Date().toISOString() },
    ]);
  }

  // ── 25. Content Pieces (Brand OS) ─────────────────────────────────────────
  if ((await db.contentPieces.count()) === 0) {
    const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
    const now = new Date().toISOString();
    await db.contentPieces.bulkAdd([
      { title: 'Why Kappa Carrageenan Outperforms Starch in Ice Cream Stabilization', type: 'LinkedIn', status: 'Published', content: 'Most ice cream manufacturers default to starch. Here\'s why that\'s leaving textural quality on the table...', tags: 'carrageenan,ice cream,food science', publishedDate: daysAgo(5), impressions: 2840, engagements: 187, platform: 'LinkedIn', createdAt: now },
      { title: 'The Hydrocolloid Synergy Nobody Talks About: κ-Carrageenan + LBG', type: 'LinkedIn', status: 'Published', content: 'Two hydrocolloids combined at the right ratio create something extraordinary: a gel stronger than either alone...', tags: 'hydrocolloid,synergy,food tech', publishedDate: daysAgo(12), impressions: 4120, engagements: 310, platform: 'LinkedIn', createdAt: now },
      { title: 'FSSAI Food Additives: A Practitioner\'s Guide to INS Numbers', type: 'Article', status: 'Published', content: 'Comprehensive guide to Indian food additive regulations...', tags: 'fssai,regulation,food safety', publishedDate: daysAgo(20), impressions: 1890, engagements: 142, platform: 'LinkedIn', createdAt: now },
      { title: 'Building a Hydrocolloid Business in India: Lessons from Year 1', type: 'Newsletter', status: 'Published', content: 'When I started KAFS, I had no customers, no plant, and no blueprint. Here\'s what the first 12 months actually looked like...', tags: 'entrepreneurship,kafs,food business', publishedDate: daysAgo(30), impressions: 3200, engagements: 256, platform: 'Newsletter', createdAt: now },
      { title: 'Rheology 101: How to Read a Viscosity Curve', type: 'LinkedIn', status: 'Published', content: 'A viscosity curve tells you more about a food system than almost any other measurement. Here\'s how to interpret one...', tags: 'rheology,food science,viscosity', publishedDate: daysAgo(7), impressions: 1560, engagements: 98, platform: 'LinkedIn', createdAt: now },
      { title: 'Cold-Soluble Carrageenan: The Future of Convenience Foods', type: 'LinkedIn', status: 'Scheduled', tags: 'carrageenan,innovation,convenience food', scheduledDate: daysAgo(-3), createdAt: now },
      { title: 'Monthly KAFS Newsletter — June 2026', type: 'Newsletter', status: 'Draft', content: 'This month\'s highlights from the KAFS lab and business front...', tags: 'newsletter,kafs,monthly', createdAt: now },
      { title: 'Pectin vs Carrageenan in Dairy: A Technical Comparison', type: 'Article', status: 'Idea', tags: 'pectin,carrageenan,dairy', createdAt: now },
    ]);
  }

  // ── 26. Notifications ─────────────────────────────────────────────────────
  if ((await db.notifications.count()) === 0) {
    const now = new Date().toISOString();
    await db.notifications.bulkAdd([
      { title: 'Follow-up Overdue', message: 'Heritage Foods follow-up was due 3 days ago.', type: 'warning', read: false, link: '/business/crm/leads', createdAt: now },
      { title: 'Batch KB20-003 In Progress', message: '100kg Heritage Foods batch has been running for 2 days. Check QC logs.', type: 'info', read: false, link: '/kafs/manufacturing', createdAt: now },
      { title: 'FSSAI Exam in 65 days', message: 'Your FSSAI Technical Officer exam is on 20 Aug 2026. Review weak topics.', type: 'warning', read: false, link: '/exams', createdAt: now },
    ]);
  }

  // ── 27. Health Goals ──────────────────────────────────────────────────────
  if ((await db.healthGoals.count()) === 0) {
    const now = new Date().toISOString();
    await db.healthGoals.bulkAdd([
      { metric: 'weight', target: 72, unit: 'kg', deadline: '2026-12-31', createdAt: now },
      { metric: 'sleep', target: 7.5, unit: 'hours', createdAt: now },
      { metric: 'exercise', target: 45, unit: 'min/day', createdAt: now },
      { metric: 'water', target: 3000, unit: 'ml/day', createdAt: now },
      { metric: 'energy', target: 8, unit: '/10', createdAt: now },
    ]);
  }

  // ── 28. Budget Categories ─────────────────────────────────────────────────
  if ((await db.budgetCategories.count()) === 0) {
    const month = new Date().toISOString().slice(0, 7);
    const now = new Date().toISOString();
    await db.budgetCategories.bulkAdd([
      { name: 'Lab Supplies', monthlyLimit: 50000, spent: 38000, month, createdAt: now },
      { name: 'Marketing & LinkedIn', monthlyLimit: 20000, spent: 18000, month, createdAt: now },
      { name: 'Travel & Client Visits', monthlyLimit: 15000, spent: 15000, month, createdAt: now },
      { name: 'SaaS & Software', monthlyLimit: 10000, spent: 8000, month, createdAt: now },
      { name: 'Professional Development', monthlyLimit: 20000, spent: 15000, month, createdAt: now },
      { name: 'Office & Utilities', monthlyLimit: 25000, spent: 22000, month, createdAt: now },
    ]);
  }

  // ── 29. Relationship Contacts ─────────────────────────────────────────────
  if ((await db.relationshipContacts.count()) === 0) {
    const now = new Date().toISOString();
    const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
    await db.relationshipContacts.bulkAdd([
      { name: 'Dr. Ramesh Kumar', role: 'Customer / Advisor', company: 'Heritage Foods Ltd', email: 'ramesh.k@heritage.com', phone: '+91 98765 43210', lastInteraction: daysAgo(1), interactionCount: 12, relationshipScore: 92, notes: 'R&D Director. Champions our stabilizer trials. High trust relationship.', tags: 'customer,advisor,dairy', createdAt: now },
      { name: 'Dr. V. Prasad', role: 'PhD Advisor Prospect', company: 'NIFTEM', email: 'vprasad@niftem.ac.in', lastInteraction: daysAgo(12), interactionCount: 4, relationshipScore: 68, notes: 'Hydrocolloid research specialist. Potential PhD supervisor. Schedule campus visit.', tags: 'academia,phd,mentor', createdAt: now },
      { name: 'Sanjay Shah', role: 'Customer Prospect', company: 'Amul Dairy Co-op', email: 'sshah@amul.coop', phone: '+91 87654 32109', lastInteraction: daysAgo(3), interactionCount: 6, relationshipScore: 74, notes: 'Procurement Head. Evaluating our yogurt stabilizer vs incumbent supplier.', tags: 'customer,dairy,high-value', createdAt: now },
      { name: 'Priya Nair', role: 'Customer', company: 'ITC Foods', email: 'p.nair@itcfoods.in', lastInteraction: daysAgo(7), interactionCount: 8, relationshipScore: 78, notes: 'Product developer. Interested in cold-soluble carrageenan for instant foods.', tags: 'customer,food processing', createdAt: now },
      { name: 'Pierre Dubois', role: 'Supplier Partner', company: 'Marinalg International', email: 'p.dubois@marinalg.fr', lastInteraction: daysAgo(20), interactionCount: 3, relationshipScore: 55, notes: 'European supplier. Negotiating SEA distribution partnership.', tags: 'supplier,international', createdAt: now },
    ]);
  }

  // ── 30. Automation Rules ──────────────────────────────────────────────────
  if ((await db.automationRules.count()) === 0) {
    const now = new Date().toISOString();
    await db.automationRules.bulkAdd([
      { name: 'Weekly Lead Follow-Up Alert', trigger: 'SCHEDULE_WEEKLY', conditions: JSON.stringify([{ field: 'lead.nextFollowUp', op: 'overdue' }]), actions: JSON.stringify([{ type: 'NOTIFICATION', message: 'Check overdue lead follow-ups in CRM' }]), isActive: true, runCount: 4, createdAt: now },
      { name: 'Daily Study Reminder', trigger: 'SCHEDULE_DAILY_8AM', conditions: JSON.stringify([]), actions: JSON.stringify([{ type: 'NOTIFICATION', message: 'Daily study session — log your study hours' }]), isActive: true, runCount: 22, createdAt: now },
      { name: 'Batch QC Alert', trigger: 'BATCH_STATUS_CHANGE', conditions: JSON.stringify([{ field: 'batch.status', op: 'equals', value: 'Completed' }]), actions: JSON.stringify([{ type: 'NOTIFICATION', message: 'Run QC check on completed batch' }]), isActive: true, runCount: 2, createdAt: now },
      { name: 'Monthly Finance Review', trigger: 'SCHEDULE_MONTHLY', conditions: JSON.stringify([]), actions: JSON.stringify([{ type: 'NOTIFICATION', message: 'Monthly finance review — update budget vs actuals' }]), isActive: false, runCount: 1, createdAt: now },
    ]);
  }

  console.log('KGOS seed check complete.');
}

// ── Hard reset: wipe ALL tables and re-run seed ───────────────────────────────
export async function resetAndReseed(): Promise<void> {
  console.log('Clearing all KGOS tables…');
  await Promise.all([
    // V1 tables
    db.tasks.clear(),
    db.goals.clear(),
    db.leads.clear(),
    db.healthLogs.clear(),
    db.researchPapers.clear(),
    db.exams.clear(),
    db.knowledgeNotes.clear(),
    db.documents.clear(),
    db.dailyReviews.clear(),
    db.projects.clear(),
    db.habits.clear(),
    db.skills.clear(),
    db.products.clear(),
    db.suppliers.clear(),
    db.transactions.clear(),
    db.contacts.clear(),
    db.opportunities.clear(),
    db.timeAllocations.clear(),
    // V2 tables (previously missing from reset)
    db.formulations.clear(),
    db.ingredients.clear(),
    db.batchRecords.clear(),
    db.studySessions.clear(),
    db.studyTopics.clear(),
    db.mockTests.clear(),
    db.contentPieces.clear(),
    db.knowledgeNodes.clear(),
    db.agentMemory.clear(),
    db.notifications.clear(),
    db.healthGoals.clear(),
    db.budgetCategories.clear(),
    db.relationshipContacts.clear(),
    db.automationRules.clear(),
  ]);
  console.log('All tables cleared. Reseeding…');
  await seedDatabase();
  console.log('Reset & reseed complete.');
}
