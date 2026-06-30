import { ROLE } from '@/types/roles';

// Sample accounts. NOTE the multi-role accounts (roles is an array):
//  - Ramesh is a Worker who also runs small contracts  -> [worker, contractor]
//  - Apex Builders contracts AND hires for its own sites -> [contractor, employer]
// Single-role accounts go straight to their dashboard; multi-role accounts
// pass through the role selector after login.

export const USERS = [
  {
    id: 'u_ramesh',
    name: 'Ramesh Kumar',
    phone: '98200-12233',
    city: 'Delhi',
    roles: [ROLE.WORKER, ROLE.CONTRACTOR],
    verified: true,
    languages: ['Hindi', 'English'],
    avatarColor: 'amber',
    workerProfile: { trade: 'Mason', skills: ['Plastering', 'Brickwork', 'Tiling'], experienceYears: 9, availability: 'available', portfolio: ['p1', 'p2', 'p3', 'p4'], rating: 4.6, jobsDone: 14 },
    contractorProfile: { businessName: 'Kumar Works', managedWorkers: 6, businessVerified: false, rating: 4.4 },
  },
  {
    id: 'u_apex',
    name: 'Apex Builders',
    phone: '98110-55000',
    city: 'Noida',
    roles: [ROLE.CONTRACTOR, ROLE.EMPLOYER],
    verified: true,
    languages: ['Hindi', 'English'],
    avatarColor: 'navy',
    contractorProfile: { businessName: 'Apex Builders Pvt Ltd', managedWorkers: 22, businessVerified: true, rating: 4.9 },
    employerProfile: { orgName: 'Apex Builders Pvt Ltd', kind: 'builder', jobsPosted: 12, rating: 4.7 },
  },
  {
    id: 'u_anita',
    name: 'Anita Devi',
    phone: '96400-44120',
    city: 'Delhi',
    roles: [ROLE.WORKER],
    verified: true,
    languages: ['Hindi'],
    avatarColor: 'teal',
    workerProfile: { trade: 'Painter', skills: ['Interior', 'Texture', 'Putty'], experienceYears: 6, availability: 'available', portfolio: ['p1', 'p2'], rating: 4.9, jobsDone: 21 },
  },
  {
    id: 'u_suresh',
    name: 'Suresh Yadav',
    phone: '97700-88421',
    city: 'Ghaziabad',
    roles: [ROLE.WORKER],
    verified: true,
    languages: ['Hindi'],
    avatarColor: 'amber',
    workerProfile: { trade: 'Plumber', skills: ['Fitting', 'Repair'], experienceYears: 4, availability: 'booked', portfolio: [], rating: 4.2, jobsDone: 8 },
  },
  {
    id: 'u_meena',
    name: 'Meena Sharma',
    phone: '99100-30912',
    city: 'Delhi',
    roles: [ROLE.EMPLOYER],
    verified: true,
    languages: ['Hindi', 'English'],
    avatarColor: 'navy',
    employerProfile: { orgName: 'Sharma Residence', kind: 'homeowner', jobsPosted: 4, rating: 4.3 },
  },
  {
    id: 'u_grand',
    name: 'Grand Crown Hotel',
    phone: '98730-21000',
    city: 'Gurugram',
    roles: [ROLE.EMPLOYER],
    verified: true,
    languages: ['English'],
    avatarColor: 'teal',
    employerProfile: { orgName: 'Grand Crown Hotel', kind: 'hotel', jobsPosted: 7, rating: 4.6 },
  },
  {
    id: 'u_priya',
    name: 'Priya Nair',
    phone: '90040-77654',
    city: 'Delhi NCR',
    roles: [ROLE.AGENT],
    verified: true,
    languages: ['Hindi', 'English', 'Malayalam'],
    avatarColor: 'amber',
    agentProfile: { coverageArea: 'West & South Delhi', registrations: 22 },
  },
  {
    id: 'u_admin',
    name: 'Platform Admin',
    phone: '90000-00001',
    city: '—',
    roles: [ROLE.ADMIN],
    verified: true,
    languages: ['English'],
    avatarColor: 'navy',
  },
];

// Convenience demo logins surfaced on the login screen.
export const DEMO_ACCOUNTS = [
  { phone: '98200-12233', label: 'Ramesh — Worker + Contractor (multi-role)' },
  { phone: '98110-55000', label: 'Apex — Contractor + Employer (multi-role)' },
  { phone: '99100-30912', label: 'Meena — Employer only' },
  { phone: '90040-77654', label: 'Priya — Agent only' },
  { phone: '90000-00001', label: 'Admin' },
];
