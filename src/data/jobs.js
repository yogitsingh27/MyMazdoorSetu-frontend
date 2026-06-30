import { ROLE } from '@/types/roles';

export const JOBS = [
  { id: 'JOB-2291', title: 'Wall plastering, 2BHK flat', trade: 'Mason', wage: '₹700–900/day', location: 'Dwarka Sector 12, Delhi', duration: '5 days', tags: ['Meals included', 'Tools provided'], postedById: 'u_meena', postedByRole: ROLE.EMPLOYER, posterRating: 4.3, posterReviews: 9, status: 'open' },
  { id: 'JOB-2288', title: 'Electrical rewiring, shop complex', trade: 'Electrician', wage: '₹900–1100/day', location: 'Karol Bagh, Delhi', duration: '3 days', tags: ['Direct contact'], postedById: 'u_ramesh', postedByRole: ROLE.CONTRACTOR, posterRating: 4.7, posterReviews: 22, status: 'open' },
  { id: 'JOB-2280', title: 'Site supervisor, residential tower', trade: 'Supervisor', wage: '₹18,000–22,000/mo', location: 'Noida Sector 62', duration: '3 months', tags: ['Long term'], postedById: 'u_apex', postedByRole: ROLE.CONTRACTOR, posterRating: 4.9, posterReviews: 41, status: 'open' },
  { id: 'JOB-2276', title: 'Interior painting, 3 rooms', trade: 'Painter', wage: '₹600–750/day', location: 'Lajpat Nagar, Delhi', duration: '4 days', tags: ['Meals included'], postedById: 'u_grand', postedByRole: ROLE.EMPLOYER, posterRating: 4.6, posterReviews: 18, status: 'open' },
  { id: 'JOB-2204', title: 'Tile fitting, bathroom', trade: 'Mason', wage: '₹3,500 fixed', location: 'Rohini, Delhi', duration: '5 days', tags: ['Tools provided'], postedById: 'u_apex', postedByRole: ROLE.EMPLOYER, posterRating: 4.7, posterReviews: 18, status: 'completed' },
];
