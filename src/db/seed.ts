import { db } from './database';

export async function seedDatabase(): Promise<void> {
  const goalCount = await db.goals.count();
  if (goalCount > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database with initial data for Kumar Gourav...');

  // 1. Vision, Mission, Values, Principles
  await db.visionData.bulkAdd([
    { key: 'vision', value: "Build KAFS into India's leading food ingredients ecosystem by 2031" },
    { key: 'mission', value: "Leverage food technology, digital systems, and structured entrepreneurship to modernize the supply, quality, and distribution of premium hydrocolloids and specialty ingredients." },
    { key: 'values', value: ['Excellence', 'Innovation', 'Integrity', 'Growth', 'Service'] },
    { key: 'principles', value: [
      "First-principles thinking in product formulation and business models.",
      "Extreme ownership of customer outcomes and supplier relationships.",
      "Local-first execution with global standards of quality.",
      "Continuous learning and skill compounding across technology and sales."
    ]}
  ]);

  // 2. Goals
  await db.goals.bulkAdd([
    { horizon: 'DECADE', category: 'BUSINESS', status: 'ACTIVE', title: 'Position KAFS as India\'s premier specialty food ingredients house', description: 'Cross ₹100Cr in annual revenue and build self-sustaining manufacturing plants.', targetDate: '2036-12-31', progress: 10, createdAt: new Date().toISOString() },
    { horizon: 'FIVE_YEAR', category: 'BUSINESS', status: 'ACTIVE', title: 'Complete food ingredient formulation facility', description: 'Establish high-care blending plant for Carrageenan and Gum formulation products.', targetDate: '2031-06-30', progress: 15, createdAt: new Date().toISOString() },
    { horizon: 'THREE_YEAR', category: 'BUSINESS', status: 'ACTIVE', title: 'Expand distribution network to 15 Indian states', description: 'Establish hubs in key food processing zones (Gujarat, Maharashtra, Tamil Nadu).', targetDate: '2029-06-30', progress: 30, createdAt: new Date().toISOString() },
    { horizon: 'ANNUAL', category: 'BUSINESS', status: 'ACTIVE', title: 'Launch proprietary hydrocolloid blend line', description: 'Formulate, test, and release 3 custom stabilizer blends for dairy & bakery applications.', targetDate: '2026-12-31', progress: 40, createdAt: new Date().toISOString() },
    { horizon: 'QUARTERLY', category: 'BUSINESS', status: 'ACTIVE', title: 'Establish baseline pipeline worth ₹50 Lakhs', description: 'Acquire and qualify B2B leads across dairy and confectionery sectors.', targetDate: '2026-09-30', progress: 60, createdAt: new Date().toISOString() }
  ]);

  // 3. Products
  await db.products.bulkAdd([
    { name: 'Kappa Carrageenan (Semi-Refined)', category: 'CARRAGEENAN', description: 'Premium grade gelling agent extracted from red seaweed. Ideal for dairy gels and processed meat.', applications: 'Chocolate milk, cheese spreads, processed ham, ice cream stabilizers.', specifications: 'Gel strength > 500 g/cm², pH 8-10, moisture < 12%', price: 750, unit: 'kg', isActive: true },
    { name: 'Iota Carrageenan (Refined)', category: 'CARRAGEENAN', description: 'Forms elastic, clear gels with syneresis control. Excellent freeze-thaw stability.', applications: 'Water gels, milk puddings, cosmetic creams.', specifications: 'Viscosity 20-40 cPs, moisture < 10%', price: 1200, unit: 'kg', isActive: true },
    { name: 'Guar Gum (200 Mesh, 5000 CPS)', category: 'HYDROCOLLOIDS', description: 'High viscosity natural thickener from guar seeds.', applications: 'Sauces, gravies, dairy desserts, bakery dough.', specifications: 'Viscosity min 5000 cPs (1% sol), pH 5.5-7.0', price: 220, unit: 'kg', isActive: true },
    { name: 'Xanthan Gum (80 Mesh)', category: 'HYDROCOLLOIDS', description: 'Reliable stabilizer and thickener with outstanding pseudoplasticity.', applications: 'Salad dressings, gluten-free baking, B2B sauces.', specifications: 'Viscosity 1200-1600 cPs, pH 6.0-8.0', price: 340, unit: 'kg', isActive: true }
  ]);

  // 4. Habits
  await db.habits.bulkAdd([
    { name: 'Morning workout (30 min)', category: 'HEALTH', frequency: 'Daily', completedDates: [], streak: 0, longestStreak: 0, isActive: true },
    { name: 'Meditation & Breathwork', category: 'SPIRITUAL', frequency: 'Daily', completedDates: [], streak: 0, longestStreak: 0, isActive: true },
    { name: 'Cold outreach (3 prospects)', category: 'PRODUCTIVITY', frequency: 'Daily', completedDates: [], streak: 0, longestStreak: 0, isActive: true },
    { name: 'Read food science journal/patent', category: 'LEARNING', frequency: 'Daily', completedDates: [], streak: 0, longestStreak: 0, isActive: true },
    { name: 'Track daily macros & protein', category: 'HEALTH', frequency: 'Daily', completedDates: [], streak: 0, longestStreak: 0, isActive: true }
  ]);

  // 5. Skills
  await db.skills.bulkAdd([
    { name: 'Food Hydrocolloids & Formulation', category: 'Food Technology', level: 8, targetLevel: 10 },
    { name: 'B2B Sales & Outreach', category: 'Sales', level: 6, targetLevel: 9 },
    { name: 'AI & Custom Agent Construction', category: 'AI', level: 5, targetLevel: 8 },
    { name: 'Food Regulatory Compliance (FSSAI)', category: 'Research', level: 7, targetLevel: 9 }
  ]);

  // 6. Sample Leads & Customers
  await db.leads.bulkAdd([
    { company: 'Heritage Foods Ltd', contact: 'Dr. Ramesh Kumar', email: 'ramesh.k@heritage.com', phone: '+91 98765 43210', industry: 'Dairy', productInterest: 'CARRAGEENAN', stage: 'TRIAL', opportunityValue: 850000, source: 'Cold Outreach', nextAction: 'Send updated sample batch of formulated stabilizer', nextActionDate: '2026-06-18', notes: 'Very interested in ice cream stabilizer blends to reduce syneresis.', createdAt: new Date().toISOString() },
    { company: 'Kwality Confectionery', contact: 'Anil Mehta', email: 'mehta.anil@kwality.in', phone: '+91 91234 56789', industry: 'Confectionery', productInterest: 'HYDROCOLLOIDS', stage: 'SAMPLE_SENT', opportunityValue: 450000, source: 'Website Inquiry', nextAction: 'Follow up on sample trials', nextActionDate: '2026-06-20', notes: 'Testing pectin replacement using custom Gellan/Carrageenan mix.', createdAt: new Date().toISOString() }
  ]);

  console.log('Seed database execution complete.');
}
