import { ROLE } from '@/types/roles';

export const JOBS = [
  {
    id: 'JOB-2291', title: 'Wall plastering, 2BHK flat', trade: 'Mason', wage: '₹700–900/day', location: 'Dwarka Sector 12, Delhi', duration: '5 days',
    tags: ['Meals included', 'Tools provided'], postedById: 'u_meena', postedByRole: ROLE.EMPLOYER, posterRating: 4.3, posterReviews: 9, status: 'open',
    description: 'Plastering work for a 2BHK flat under renovation. Walls are already prepped — plastering and finishing needed for 4 rooms plus one bathroom.',
    requirements: ['2+ years of plastering experience', 'Own basic hand tools', 'Available to start within 3 days'],
    postedAt: '2026-06-29', openings: 2,
  },
  {
    id: 'JOB-2288', title: 'Electrical rewiring, shop complex', trade: 'Electrician', wage: '₹900–1100/day', location: 'Karol Bagh, Delhi', duration: '3 days',
    tags: ['Direct contact'], postedById: 'u_ramesh', postedByRole: ROLE.CONTRACTOR, posterRating: 4.7, posterReviews: 22, status: 'open',
    description: 'Full rewiring of a 3-shop commercial complex — old wiring needs to be replaced with new copper wiring and updated distribution boards.',
    requirements: ['Licensed electrician preferred', 'Own multimeter and basic tools', 'Comfortable working at height (ladder work)'],
    postedAt: '2026-06-30', openings: 3,
  },
  {
    id: 'JOB-2280', title: 'Site supervisor, residential tower', trade: 'Supervisor', wage: '₹18,000–22,000/mo', location: 'Noida Sector 62', duration: '3 months',
    tags: ['Long term'], postedById: 'u_apex', postedByRole: ROLE.CONTRACTOR, posterRating: 4.9, posterReviews: 41, status: 'open',
    description: 'Supervise daily site activity for an ongoing residential tower project — coordinate contractor crews, track material deliveries, and report progress.',
    requirements: ['3+ years supervising construction sites', 'Comfortable with basic daily reporting', 'Own smartphone for site photo updates'],
    postedAt: '2026-06-25', openings: 1,
  },
  {
    id: 'JOB-2276', title: 'Interior painting, 3 rooms', trade: 'Painter', wage: '₹600–750/day', location: 'Lajpat Nagar, Delhi', duration: '4 days',
    tags: ['Meals included'], postedById: 'u_grand', postedByRole: ROLE.EMPLOYER, posterRating: 4.6, posterReviews: 18, status: 'open',
    description: 'Interior painting for 3 rooms in a hotel guest wing — walls need two coats plus minor putty work before painting.',
    requirements: ['Experience with interior wall painting', 'Own brushes and rollers', 'Available on weekdays'],
    postedAt: '2026-06-28', openings: 2,
  },
  {
    id: 'JOB-2204', title: 'Tile fitting, bathroom', trade: 'Mason', wage: '₹3,500 fixed', location: 'Rohini, Delhi', duration: '5 days',
    tags: ['Tools provided'], postedById: 'u_apex', postedByRole: ROLE.EMPLOYER, posterRating: 4.7, posterReviews: 18, status: 'completed',
    description: 'Tile fitting for a single bathroom — tiles and adhesive already purchased, fitting and grouting needed.',
    requirements: ['Experience with bathroom tile fitting', 'Own tile cutter'],
    postedAt: '2026-06-10', openings: 1,
  },
];
