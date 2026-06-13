/* =========================================
   KGOS 2031 — Constants & Enums
   ========================================= */

// Goal time horizons
export const GOAL_HORIZONS = [
  { key: 'DECADE', label: '10-Year Goals', icon: 'Mountain' },
  { key: 'FIVE_YEAR', label: '5-Year Goals', icon: 'Flag' },
  { key: 'THREE_YEAR', label: '3-Year Goals', icon: 'Target' },
  { key: 'ANNUAL', label: 'Annual Goals', icon: 'Calendar' },
  { key: 'QUARTERLY', label: 'Quarterly Goals', icon: 'CalendarDays' },
  { key: 'MONTHLY', label: 'Monthly Goals', icon: 'CalendarRange' },
  { key: 'WEEKLY', label: 'Weekly Goals', icon: 'CalendarClock' },
  { key: 'DAILY', label: 'Daily Priorities', icon: 'ListTodo' }
];

// Project categories
export const PROJECT_CATEGORIES = [
  { key: 'BUSINESS', label: 'Business', color: '#3b82f6', icon: 'Building2' },
  { key: 'RESEARCH', label: 'Research', color: '#8b5cf6', icon: 'Microscope' },
  { key: 'CAREER', label: 'Career', color: '#06b6d4', icon: 'Briefcase' },
  { key: 'EXAMS', label: 'Government Exams', color: '#f59e0b', icon: 'BookOpen' },
  { key: 'BRAND', label: 'Brand', color: '#ec4899', icon: 'Megaphone' },
  { key: 'AI', label: 'AI', color: '#10b981', icon: 'Bot' },
  { key: 'PERSONAL', label: 'Personal Development', color: '#f97316', icon: 'Sparkles' }
];

// Project statuses with visual config
export const PROJECT_STATUSES = [
  { key: 'NOT_STARTED', label: 'Not Started', color: '#555570' },
  { key: 'PLANNING', label: 'Planning', color: '#8b5cf6' },
  { key: 'ACTIVE', label: 'Active', color: '#3b82f6' },
  { key: 'WAITING', label: 'Waiting', color: '#f59e0b' },
  { key: 'COMPLETED', label: 'Completed', color: '#10b981' },
  { key: 'ARCHIVED', label: 'Archived', color: '#555570' }
];

// Task priorities
export const TASK_PRIORITIES = [
  { key: 'CRITICAL', label: 'Critical', color: '#f43f5e' },
  { key: 'HIGH', label: 'High', color: '#f59e0b' },
  { key: 'MEDIUM', label: 'Medium', color: '#3b82f6' },
  { key: 'LOW', label: 'Low', color: '#555570' }
];

// Task statuses
export const TASK_STATUSES = [
  { key: 'TODO', label: 'To Do', color: '#8888a0' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { key: 'DONE', label: 'Done', color: '#10b981' },
  { key: 'BLOCKED', label: 'Blocked', color: '#f43f5e' }
];

// CRM Lead stages (pipeline order)
export const LEAD_STAGES = [
  { key: 'NEW', label: 'New Lead', color: '#8888a0' },
  { key: 'CONTACTED', label: 'Contacted', color: '#8b5cf6' },
  { key: 'QUALIFIED', label: 'Qualified', color: '#3b82f6' },
  { key: 'SAMPLE_SENT', label: 'Sample Sent', color: '#06b6d4' },
  { key: 'TRIAL', label: 'Trial', color: '#f59e0b' },
  { key: 'PROPOSAL', label: 'Proposal', color: '#f97316' },
  { key: 'CUSTOMER', label: 'Customer', color: '#10b981' },
  { key: 'REPEAT', label: 'Repeat Customer', color: '#22d3ee' }
];

// Product categories (KAFS)
export const PRODUCT_CATEGORIES = [
  { key: 'HYDROCOLLOIDS', label: 'Hydrocolloids', icon: 'Droplets' },
  { key: 'CARRAGEENAN', label: 'Carrageenan', icon: 'Waves' },
  { key: 'FOOD_INGREDIENTS', label: 'Food Ingredients', icon: 'ChefHat' },
  { key: 'AGRICULTURAL_INPUTS', label: 'Agricultural Inputs', icon: 'Sprout' },
  { key: 'CONSULTING', label: 'Consulting Services', icon: 'Lightbulb' },
  { key: 'TRAINING', label: 'Training Services', icon: 'GraduationCap' }
];

// Relationship categories
export const RELATIONSHIP_CATEGORIES = [
  { key: 'FAMILY', label: 'Family', icon: 'Home', color: '#f43f5e' },
  { key: 'FRIENDS', label: 'Friends', icon: 'Heart', color: '#ec4899' },
  { key: 'MENTORS', label: 'Mentors', icon: 'Star', color: '#f59e0b' },
  { key: 'CUSTOMERS', label: 'Customers', icon: 'Handshake', color: '#10b981' },
  { key: 'RESEARCHERS', label: 'Researchers', icon: 'Microscope', color: '#8b5cf6' },
  { key: 'RECRUITERS', label: 'Recruiters', icon: 'UserSearch', color: '#3b82f6' },
  { key: 'EXPERTS', label: 'Industry Experts', icon: 'Award', color: '#06b6d4' }
];

// Skill categories
export const SKILL_CATEGORIES = [
  'Food Technology', 'Agriculture', 'Manufacturing',
  'Sales', 'Marketing', 'AI', 'Research',
  'Communication', 'Leadership'
];

// Habit categories
export const HABIT_CATEGORIES = [
  { key: 'HEALTH', label: 'Health', icon: 'Heart', color: '#f43f5e' },
  { key: 'LEARNING', label: 'Learning', icon: 'BookOpen', color: '#3b82f6' },
  { key: 'PRODUCTIVITY', label: 'Productivity', icon: 'Zap', color: '#f59e0b' },
  { key: 'SPIRITUAL', label: 'Spiritual', icon: 'Sun', color: '#8b5cf6' },
  { key: 'SOCIAL', label: 'Social', icon: 'Users', color: '#10b981' }
];

// Journal/Review types
export const REVIEW_TYPES = [
  { key: 'DAILY', label: 'Daily Review' },
  { key: 'WEEKLY', label: 'Weekly Review' },
  { key: 'MONTHLY', label: 'Monthly Review' },
  { key: 'QUARTERLY', label: 'Quarterly Review' },
  { key: 'ANNUAL', label: 'Annual Review' }
];

// Task categories for execution center
export const TASK_CATEGORIES = [
  { key: 'REVENUE', label: 'Revenue', icon: 'IndianRupee', color: '#10b981' },
  { key: 'FOLLOW_UP', label: 'Follow-Up', icon: 'PhoneCall', color: '#f59e0b' },
  { key: 'STUDY', label: 'Study', icon: 'BookOpen', color: '#3b82f6' },
  { key: 'RESEARCH', label: 'Research', icon: 'Microscope', color: '#8b5cf6' },
  { key: 'CONTENT', label: 'Content', icon: 'PenTool', color: '#ec4899' },
  { key: 'HEALTH', label: 'Health', icon: 'Heart', color: '#f43f5e' },
  { key: 'ADMIN', label: 'Admin', icon: 'Settings', color: '#555570' }
];

// Sidebar navigation structure
export const NAV_ITEMS = [
  {
    group: 'Command',
    items: [
      { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/execution', label: 'Execution', icon: 'Zap' }
    ]
  },
  {
    group: 'Life',
    items: [
      { path: '/life-plan', label: 'Life Plan', icon: 'Compass' },
      { path: '/self-mastery', label: 'Self Mastery', icon: 'Brain' },
      { path: '/self-mastery/health', label: 'Health', icon: 'Heart' },
      { path: '/self-mastery/habits', label: 'Habits', icon: 'CheckCircle' },
      { path: '/self-mastery/development', label: 'Development', icon: 'GraduationCap' },
      { path: '/self-mastery/relationships', label: 'Relationships', icon: 'Users' }
    ]
  },
  {
    group: 'Business',
    items: [
      { path: '/business', label: 'KAFS ERP', icon: 'Building2' },
      { path: '/business/crm', label: 'CRM', icon: 'UserPlus' },
      { path: '/business/products', label: 'Products', icon: 'Package' },
      { path: '/business/suppliers', label: 'Suppliers', icon: 'Truck' },
      { path: '/business/sales', label: 'Sales', icon: 'TrendingUp' }
    ]
  },
  {
    group: 'Growth',
    items: [
      { path: '/projects', label: 'Projects', icon: 'FolderKanban' }
    ]
  },
  {
    group: 'System',
    items: [
      { path: '/settings', label: 'Settings', icon: 'Settings' }
    ]
  }
];

// Chart colors palette
export const CHART_COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
  '#f43f5e', '#8b5cf6', '#ec4899', '#f97316'
];

// Industries for CRM
export const INDUSTRIES = [
  'Dairy', 'Meat Processing', 'Bakery', 'Confectionery',
  'Beverages', 'Nutraceuticals', 'Pet Food', 'Pharmaceuticals',
  'Cosmetics', 'Textiles', 'Paper', 'Agriculture',
  'Food Service', 'Retail', 'Other'
];

// Helper: find item by key in array of {key, label, ...}
export function findByKey(arr, key) {
  return arr.find(item => item.key === key);
}

// Helper: get label for a key
export function getLabel(arr, key) {
  const item = arr.find(i => i.key === key);
  return item ? item.label : key;
}

// Helper: get color for a key
export function getColor(arr, key) {
  const item = arr.find(i => i.key === key);
  return item ? item.color : '#555570';
}
