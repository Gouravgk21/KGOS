/* =========================================
   KGOS 2031 — Constants & Enums
   ========================================= */

export interface ConfigItem {
  key: string;
  label: string;
  icon?: string;
  color?: string;
}

export const GOAL_HORIZONS: ConfigItem[] = [
  { key: 'DECADE', label: '10-Year Goals', icon: 'Mountain' },
  { key: 'FIVE_YEAR', label: '5-Year Goals', icon: 'Flag' },
  { key: 'THREE_YEAR', label: '3-Year Goals', icon: 'Target' },
  { key: 'ANNUAL', label: 'Annual Goals', icon: 'Calendar' },
  { key: 'QUARTERLY', label: 'Quarterly Goals', icon: 'CalendarDays' },
  { key: 'MONTHLY', label: 'Monthly Goals', icon: 'CalendarRange' },
  { key: 'WEEKLY', label: 'Weekly Goals', icon: 'CalendarClock' },
  { key: 'DAILY', label: 'Daily Priorities', icon: 'ListTodo' }
];

export const PROJECT_CATEGORIES: ConfigItem[] = [
  { key: 'BUSINESS', label: 'Business', color: '#3b82f6', icon: 'Building2' },
  { key: 'RESEARCH', label: 'Research', color: '#8b5cf6', icon: 'Microscope' },
  { key: 'CAREER', label: 'Career', color: '#06b6d4', icon: 'Briefcase' },
  { key: 'EXAMS', label: 'Government Exams', color: '#f59e0b', icon: 'BookOpen' },
  { key: 'BRAND', label: 'Brand', color: '#ec4899', icon: 'Megaphone' },
  { key: 'AI', label: 'AI', color: '#10b981', icon: 'Bot' },
  { key: 'PERSONAL', label: 'Personal Development', color: '#f97316', icon: 'Sparkles' }
];

export const PROJECT_STATUSES: ConfigItem[] = [
  { key: 'NOT_STARTED', label: 'Not Started', color: '#555570' },
  { key: 'PLANNING', label: 'Planning', color: '#8b5cf6' },
  { key: 'ACTIVE', label: 'Active', color: '#3b82f6' },
  { key: 'WAITING', label: 'Waiting', color: '#f59e0b' },
  { key: 'COMPLETED', label: 'Completed', color: '#10b981' },
  { key: 'ARCHIVED', label: 'Archived', color: '#555570' }
];

export const TASK_PRIORITIES: ConfigItem[] = [
  { key: 'CRITICAL', label: 'Critical', color: '#f43f5e' },
  { key: 'HIGH', label: 'High', color: '#f59e0b' },
  { key: 'MEDIUM', label: 'Medium', color: '#3b82f6' },
  { key: 'LOW', label: 'Low', color: '#555570' }
];

export const TASK_STATUSES: ConfigItem[] = [
  { key: 'TODO', label: 'To Do', color: '#8888a0' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { key: 'DONE', label: 'Done', color: '#10b981' },
  { key: 'BLOCKED', label: 'Blocked', color: '#f43f5e' }
];

export const LEAD_STAGES: ConfigItem[] = [
  { key: 'NEW', label: 'New Lead', color: '#8888a0' },
  { key: 'CONTACTED', label: 'Contacted', color: '#8b5cf6' },
  { key: 'QUALIFIED', label: 'Qualified', color: '#3b82f6' },
  { key: 'SAMPLE_SENT', label: 'Sample Sent', color: '#06b6d4' },
  { key: 'TRIAL', label: 'Trial', color: '#f59e0b' },
  { key: 'PROPOSAL', label: 'Proposal', color: '#f97316' },
  { key: 'CUSTOMER', label: 'Customer', color: '#10b981' },
  { key: 'REPEAT', label: 'Repeat Customer', color: '#22d3ee' }
];

export const PRODUCT_CATEGORIES: ConfigItem[] = [
  { key: 'HYDROCOLLOIDS', label: 'Hydrocolloids', icon: 'Droplets' },
  { key: 'CARRAGEENAN', label: 'Carrageenan', icon: 'Waves' },
  { key: 'FOOD_INGREDIENTS', label: 'Food Ingredients', icon: 'ChefHat' },
  { key: 'AGRICULTURAL_INPUTS', label: 'Agricultural Inputs', icon: 'Sprout' },
  { key: 'CONSULTING', label: 'Consulting Services', icon: 'Lightbulb' },
  { key: 'TRAINING', label: 'Training Services', icon: 'GraduationCap' }
];

export const RELATIONSHIP_CATEGORIES: ConfigItem[] = [
  { key: 'FAMILY', label: 'Family', icon: 'Home', color: '#f43f5e' },
  { key: 'FRIENDS', label: 'Friends', icon: 'Heart', color: '#ec4899' },
  { key: 'MENTORS', label: 'Mentors', icon: 'Star', color: '#f59e0b' },
  { key: 'CUSTOMERS', label: 'Customers', icon: 'Handshake', color: '#10b981' },
  { key: 'RESEARCHERS', label: 'Researchers', icon: 'Microscope', color: '#8b5cf6' },
  { key: 'RECRUITERS', label: 'Recruiters', icon: 'UserSearch', color: '#3b82f6' },
  { key: 'EXPERTS', label: 'Industry Experts', icon: 'Award', color: '#06b6d4' }
];

export const SKILL_CATEGORIES: string[] = [
  'Food Technology', 'Agriculture', 'Manufacturing',
  'Sales', 'Marketing', 'AI', 'Research',
  'Communication', 'Leadership'
];

export const HABIT_CATEGORIES: ConfigItem[] = [
  { key: 'HEALTH', label: 'Health', icon: 'Heart', color: '#f43f5e' },
  { key: 'LEARNING', label: 'Learning', icon: 'BookOpen', color: '#3b82f6' },
  { key: 'PRODUCTIVITY', label: 'Productivity', icon: 'Zap', color: '#f59e0b' },
  { key: 'SPIRITUAL', label: 'Spiritual', icon: 'Sun', color: '#8b5cf6' },
  { key: 'SOCIAL', label: 'Social', icon: 'Users', color: '#10b981' }
];

export const REVIEW_TYPES: ConfigItem[] = [
  { key: 'DAILY', label: 'Daily Review' },
  { key: 'WEEKLY', label: 'Weekly Review' },
  { key: 'MONTHLY', label: 'Monthly Review' },
  { key: 'QUARTERLY', label: 'Quarterly Review' },
  { key: 'ANNUAL', label: 'Annual Review' }
];

export const TASK_CATEGORIES: ConfigItem[] = [
  { key: 'REVENUE', label: 'Revenue', icon: 'IndianRupee', color: '#10b981' },
  { key: 'FOLLOW_UP', label: 'Follow-Up', icon: 'PhoneCall', color: '#f59e0b' },
  { key: 'STUDY', label: 'Study', icon: 'BookOpen', color: '#3b82f6' },
  { key: 'RESEARCH', label: 'Research', icon: 'Microscope', color: '#8b5cf6' },
  { key: 'CONTENT', label: 'Content', icon: 'PenTool', color: '#ec4899' },
  { key: 'HEALTH', label: 'Health', icon: 'Heart', color: '#f43f5e' },
  { key: 'ADMIN', label: 'Admin', icon: 'Settings', color: '#555570' }
];

export interface NavGroup {
  group: string;
  items: {
    path: string;
    label: string;
    icon: string;
  }[];
}

export const NAV_ITEMS: NavGroup[] = [
  {
    group: 'Command',
    items: [
      { path: '/', label: 'Command Center', icon: 'LayoutDashboard' },
      { path: '/tasks', label: 'Execution Engine', icon: 'Zap' },
      { path: '/reporting', label: 'Analytics OS', icon: 'TrendingUp' }
    ]
  },
  {
    group: 'Life',
    items: [
      { path: '/digital-twin', label: 'Digital Twin', icon: 'Brain' },
      { path: '/self-mastery/health', label: 'Health OS', icon: 'Heart' },
      { path: '/reviews', label: 'Daily Reviews', icon: 'BookOpen' },
      { path: '/relationships', label: 'Relationships', icon: 'Users' },
      { path: '/wealth', label: 'Wealth OS', icon: 'IndianRupee' }
    ]
  },
  {
    group: 'Business',
    items: [
      { path: '/business', label: 'KAFS B2B ERP', icon: 'Building2' },
      { path: '/formulation-lab', label: 'Formulation Lab', icon: 'FlaskConical' },
      { path: '/business/crm', label: 'CRM', icon: 'UserPlus' },
      { path: '/business/products', label: 'Products', icon: 'Package' },
      { path: '/business/suppliers', label: 'Suppliers', icon: 'Truck' }
    ]
  },
  {
    group: 'Growth',
    items: [
      { path: '/projects', label: 'Projects OS', icon: 'FolderKanban' },
      { path: '/research', label: 'Research OS', icon: 'Microscope' },
      { path: '/publication-os', label: 'Publication OS', icon: 'FileText' },
      { path: '/exams', label: 'Exam OS', icon: 'GraduationCap' },
      { path: '/career', label: 'Career OS', icon: 'Briefcase' },
      { path: '/knowledge', label: 'Knowledge Graph', icon: 'Network' }
    ]
  },
  {
    group: 'AI & Intel',
    items: [
      { path: '/ai-board', label: 'AI Executive Board', icon: 'Cpu' },
      { path: '/document-intel', label: 'Document Intel', icon: 'FileText' },
      { path: '/radar', label: 'Opportunity Radar', icon: 'Radar' },
      { path: '/risks', label: 'Risk Engine', icon: 'ShieldAlert' }
    ]
  },
  {
    group: 'System',
    items: [
      { path: '/settings', label: 'Settings', icon: 'Settings' }
    ]
  }
];

export const CHART_COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
  '#f43f5e', '#8b5cf6', '#ec4899', '#f97316'
];

export const INDUSTRIES = [
  'Dairy', 'Meat Processing', 'Bakery', 'Confectionery',
  'Beverages', 'Nutraceuticals', 'Pet Food', 'Pharmaceuticals',
  'Cosmetics', 'Textiles', 'Paper', 'Agriculture',
  'Food Service', 'Retail', 'Other'
];

export function findByKey(arr: ConfigItem[], key: string): ConfigItem | undefined {
  return arr.find(item => item.key === key);
}

export function getLabel(arr: ConfigItem[], key: string): string {
  const item = arr.find(i => i.key === key);
  return item ? item.label : key;
}

export function getColor(arr: ConfigItem[], key: string): string {
  const item = arr.find(i => i.key === key);
  return item ? item.color || '#555570' : '#555570';
}
