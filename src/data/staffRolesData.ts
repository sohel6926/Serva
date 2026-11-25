export interface AdminModulePermission {
  id: string;
  name: string;
  description: string;
}

/**
 * SERVA Native Admin Modules (Strictly aligned with actual sections present in SERVA Admin Panel)
 */
export const ADMIN_MODULES: AdminModulePermission[] = [
  {
    id: 'orders',
    name: 'Orders & Dispatch',
    description: 'Track customer bookings, assign technicians & verify service completion OTPs',
  },
  {
    id: 'kyc',
    name: 'Partner KYC & Verification',
    description: 'Verify individual PAN cards, business GST licenses, and approve/reject partners',
  },
  {
    id: 'categories',
    name: 'Categories & Sub-Categories',
    description: 'Add or remove platform service categories and technician/shop sub-categories',
  },
  {
    id: 'banners',
    name: 'Manage Promotional Banners',
    description: 'Create, toggle, and manage hero carousel slides and homepage marketing banners',
  },
  {
    id: 'commission',
    name: 'Commission Setup',
    description: 'Configure platform commission percentages globally and by service category',
  },
  {
    id: 'coupons',
    name: 'Coupons & Deals',
    description: 'Create promotional discount vouchers, promo codes, and customer discount rules',
  },
  {
    id: 'users',
    name: 'Customer Users Directory',
    description: 'View registered customer accounts, booking history, and manage user statuses',
  },
  {
    id: 'partners',
    name: 'Service Partners Directory',
    description: 'Oversee registered partners, daily wages, and interior/event planner portfolios',
  },
  {
    id: 'withdrawals',
    name: 'Withdrawals & Wallet Payouts',
    description: 'Review and disburse partner earnings payouts via UPI or Bank transfer',
  },
  {
    id: 'support',
    name: 'Support Tickets & Helpdesk',
    description: 'Resolve customer and partner disputes, booking issues, and inquiries',
  },
  {
    id: 'announcements',
    name: 'Broadcast Announcements',
    description: 'Send alerts, updates, and push notifications to customers and partner apps',
  },
  {
    id: 'reports',
    name: 'Reports & Revenue Analytics',
    description: 'Export GMV metrics, category revenue breakdowns, and order audit CSVs',
  },
  {
    id: 'roles',
    name: 'Staff & Roles (RBAC)',
    description: 'Manage admin panel team members, divisions, and modular access control',
  },
];

export const STAFF_DIVISIONS = [
  'Operations & Dispatch',
  'Partner Verification & KYC',
  'Customer Support & Helpdesk',
  'Finance & Wallet Settlements',
  'Category & Content Management',
  'Marketing & Growth',
];

export const STAFF_ROLES = [
  'Super Admin',
  'Operations & Dispatch Lead',
  'KYC Compliance Officer',
  'Customer Support Lead',
  'Finance & Payout Manager',
  'Category & Platform Manager',
  'Field Operations Supervisor',
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
    division: 'Operations & Dispatch',
    role: 'Operations & Dispatch Lead',
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
    division: 'Partner Verification & KYC',
    role: 'KYC Compliance Officer',
    permissions: ['kyc', 'partners', 'categories', 'support'],
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
    division: 'Customer Support & Helpdesk',
    role: 'Customer Support Lead',
    permissions: ['orders', 'users', 'support', 'announcements'],
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
    division: 'Finance & Wallet Settlements',
    role: 'Finance & Payout Manager',
    permissions: ['commission', 'withdrawals', 'coupons', 'reports'],
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
      const validModuleIds = new Set(ADMIN_MODULES.map((m) => m.id));
      // Sanitize against valid SERVA modules to avoid displaying outdated/legacy permissions
      const sanitized: StaffMember[] = parsed.map((member: StaffMember) => {
        const validPerms = (member.permissions || []).filter((p) => validModuleIds.has(p));
        return {
          ...member,
          permissions: validPerms.length > 0 ? validPerms : ADMIN_MODULES.map((m) => m.id),
        };
      });
      return sanitized;
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
