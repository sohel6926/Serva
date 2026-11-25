export interface AdminModulePermission {
  id: string;
  name: string;
  description: string;
}

export const ADMIN_MODULES: AdminModulePermission[] = [
  {
    id: 'manage_inventory',
    name: 'Manage Inventory',
    description: 'View and manage service equipment & tool listings',
  },
  {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'View and manage customer and partner accounts',
  },
  {
    id: 'manage_requests',
    name: 'Manage Requests',
    description: 'Handle booking, quote, and emergency requests',
  },
  {
    id: 'manage_banners',
    name: 'Manage Banners',
    description: 'Create and manage promotional banners',
  },
  {
    id: 'manage_faqs',
    name: 'Manage FAQs',
    description: 'Manage frequently asked questions',
  },
  {
    id: 'manage_articles',
    name: 'Manage Articles',
    description: 'Create and publish blog posts & service guides',
  },
  {
    id: 'moderate_reviews',
    name: 'Moderate Reviews',
    description: 'Moderate user reviews and ratings',
  },
  {
    id: 'secure_chats',
    name: 'Secure Chats',
    description: 'Admin-User and partner communication',
  },
  {
    id: 'manage_staff',
    name: 'Manage Staff & Roles',
    description: 'Manage admin team members and access control',
  },
  {
    id: 'manage_master_data',
    name: 'Manage Master Data',
    description: 'Manage categories, sub-categories, cities & zones',
  },
  {
    id: 'manage_subscriptions',
    name: 'Manage Subscriptions',
    description: 'Manage partner commission rates & tiers',
  },
  {
    id: 'send_notifications',
    name: 'Send Notifications',
    description: 'Send broadcast and push notifications',
  },
  {
    id: 'manage_settings',
    name: 'Manage Settings',
    description: 'System configuration and preferences',
  },
  {
    id: 'view_reports',
    name: 'View Reports',
    description: 'Analytics and performance metrics',
  },
  {
    id: 'manage_billing',
    name: 'Manage Billing',
    description: 'Payment records, commission & transactions',
  },
];

export const STAFF_DIVISIONS = [
  'Operations',
  'Customer Support',
  'Partner Onboarding & KYC',
  'Finance & Accounts',
  'Technology & Engineering',
  'Marketing & Growth',
];

export const STAFF_ROLES = [
  'Super Admin',
  'Operations Manager',
  'Customer Support Lead',
  'KYC Compliance Officer',
  'Finance & Payout Manager',
  'Catalog & Content Manager',
  'Field Supervisor',
  'Support Executive',
];

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  division: string;
  role: string;
  permissions: string[]; // module ids
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string;
}

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-1',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh@serva.in',
    phone: '9985955533',
    division: 'Operations',
    role: 'Operations Manager',
    permissions: ADMIN_MODULES.map((m) => m.id),
    status: 'ACTIVE',
    createdAt: '2026-10-15',
    lastLogin: 'Today, 10:30 AM',
  },
  {
    id: 'staff-2',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.s@serva.in',
    phone: '9848012345',
    division: 'Partner Onboarding & KYC',
    role: 'KYC Compliance Officer',
    permissions: ['manage_users', 'manage_requests', 'manage_master_data', 'moderate_reviews', 'secure_chats'],
    status: 'ACTIVE',
    createdAt: '2026-10-20',
    lastLogin: 'Yesterday, 04:15 PM',
  },
  {
    id: 'staff-3',
    firstName: 'Karthik',
    lastName: 'Naidu',
    email: 'karthik.n@serva.in',
    phone: '9949098765',
    division: 'Customer Support',
    role: 'Customer Support Lead',
    permissions: ['manage_users', 'manage_requests', 'manage_faqs', 'moderate_reviews', 'secure_chats', 'send_notifications'],
    status: 'ACTIVE',
    createdAt: '2026-11-01',
    lastLogin: 'Today, 08:45 AM',
  },
  {
    id: 'staff-4',
    firstName: 'Anita',
    lastName: 'Deshmukh',
    email: 'anita.d@serva.in',
    phone: '9123456780',
    division: 'Finance & Accounts',
    role: 'Finance & Payout Manager',
    permissions: ['manage_billing', 'manage_subscriptions', 'view_reports', 'manage_settings'],
    status: 'ACTIVE',
    createdAt: '2026-11-05',
    lastLogin: '2 days ago',
  },
];

const STAFF_STORAGE_KEY = 'serva_admin_staff';

export function getStoredStaff(): StaffMember[] {
  if (typeof window === 'undefined') return INITIAL_STAFF_MEMBERS;
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(INITIAL_STAFF_MEMBERS));
      return INITIAL_STAFF_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}
  return INITIAL_STAFF_MEMBERS;
}

export function saveStoredStaff(staff: StaffMember[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
    window.dispatchEvent(new CustomEvent('serva:staff-updated', { detail: staff }));
  } catch (err) {
    console.error('Failed to save staff:', err);
  }
}

export function addStaffMember(member: Omit<StaffMember, 'id' | 'createdAt'> & { id?: string }): StaffMember[] {
  const current = getStoredStaff();
  const newMember: StaffMember = {
    ...member,
    id: member.id || `staff-${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const updated = [newMember, ...current];
  saveStoredStaff(updated);
  return updated;
}

export function removeStaffMember(id: string): StaffMember[] {
  const current = getStoredStaff();
  const updated = current.filter((s) => s.id !== id);
  saveStoredStaff(updated);
  return updated;
}

export function toggleStaffStatus(id: string): StaffMember[] {
  const current = getStoredStaff();
  const updated = current.map((s) =>
    s.id === id ? { ...s, status: s.status === 'ACTIVE' ? ('SUSPENDED' as const) : ('ACTIVE' as const) } : s
  );
  saveStoredStaff(updated);
  return updated;
}
