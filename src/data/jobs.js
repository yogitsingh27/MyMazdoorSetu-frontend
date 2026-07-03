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
  // The following give Search & Filters something real to narrow — diverse
  // across all 8 trades and all 4 cities, not added for realism-by-volume.
  {
    id: 'JOB-2295', title: 'Bathroom fitting, new construction flat', trade: 'Plumber', wage: '₹800–1000/day', location: 'Sector 45, Gurugram', duration: '4 days',
    tags: ['Tools provided'], postedById: 'u_apex', postedByRole: ROLE.CONTRACTOR, posterRating: 4.8, posterReviews: 35, status: 'open',
    description: 'Complete bathroom plumbing fit-out for a new-construction flat — pipe fitting, fixture installation, and pressure testing.',
    requirements: ['3+ years plumbing experience', 'Own basic tools', 'Familiar with CPVC fitting'],
    postedAt: '2026-06-27', openings: 1,
  },
  {
    id: 'JOB-2299', title: 'Modular kitchen installation', trade: 'Carpenter', wage: '₹900–1200/day', location: 'Vaishali, Ghaziabad', duration: '6 days',
    tags: ['Meals included'], postedById: 'u_meena', postedByRole: ROLE.EMPLOYER, posterRating: 4.3, posterReviews: 9, status: 'open',
    description: 'Installation of a pre-fabricated modular kitchen — carcass assembly, shutter fitting, and hardware installation.',
    requirements: ['Experience with modular kitchen installation', 'Own power tools', 'Careful, precise fitting work'],
    postedAt: '2026-06-26', openings: 2,
  },
  {
    id: 'JOB-2305', title: 'Gate and grill welding, residential complex', trade: 'Welder', wage: '₹1000–1300/day', location: 'Sector 62, Noida', duration: '5 days',
    tags: ['Tools provided', 'Direct contact'], postedById: 'u_apex', postedByRole: ROLE.CONTRACTOR, posterRating: 4.9, posterReviews: 41, status: 'open',
    description: 'Fabrication and installation of iron gates and window grills for a residential complex under construction.',
    requirements: ['Experience with arc welding', 'Own welding mask and gloves', 'Comfortable with on-site fabrication'],
    postedAt: '2026-06-24', openings: 2,
  },
  {
    id: 'JOB-2308', title: 'General site helper, construction site', trade: 'Helper', wage: '₹500–600/day', location: 'Dwarka Sector 21, Delhi', duration: '10 days',
    tags: ['Meals included'], postedById: 'u_ramesh', postedByRole: ROLE.CONTRACTOR, posterRating: 4.7, posterReviews: 22, status: 'open',
    description: 'General labour support on an active construction site — carrying material, mixing cement, and assisting skilled workers.',
    requirements: ['No prior experience required', 'Physically fit for manual work'],
    postedAt: '2026-06-30', openings: 4,
  },
  {
    id: 'JOB-2312', title: 'Boundary wall construction', trade: 'Mason', wage: '₹700–850/day', location: 'Sector 57, Gurugram', duration: '8 days',
    tags: ['Tools provided'], postedById: 'u_grand', postedByRole: ROLE.EMPLOYER, posterRating: 4.6, posterReviews: 18, status: 'open',
    description: 'Construction of a boundary wall for a plot — brickwork, plastering, and finishing.',
    requirements: ['Experience with brickwork', 'Own trowels and levels'],
    postedAt: '2026-06-23', openings: 3,
  },
  {
    id: 'JOB-2315', title: 'New wiring, 3BHK flat', trade: 'Electrician', wage: '₹850–1000/day', location: 'Kavi Nagar, Ghaziabad', duration: '4 days',
    tags: ['Direct contact'], postedById: 'u_meena', postedByRole: ROLE.EMPLOYER, posterRating: 4.3, posterReviews: 9, status: 'open',
    description: 'Complete electrical wiring for a new 3BHK flat — conduit laying, wiring, and switchboard installation.',
    requirements: ['Licensed electrician preferred', 'Own wiring tools'],
    postedAt: '2026-06-28', openings: 1,
  },
  {
    id: 'JOB-2318', title: 'Exterior painting, villa', trade: 'Painter', wage: '₹650–800/day', location: 'Sector 50, Noida', duration: '6 days',
    tags: ['Tools provided'], postedById: 'u_apex', postedByRole: ROLE.CONTRACTOR, posterRating: 4.9, posterReviews: 41, status: 'open',
    description: 'Exterior wall painting for an independent villa — surface prep, primer, and weatherproof top coat.',
    requirements: ['Experience with exterior/weatherproof paints', 'Comfortable working on ladders/scaffolding'],
    postedAt: '2026-06-22', openings: 2,
  },
  {
    id: 'JOB-2322', title: 'Pipeline leak repair, shop', trade: 'Plumber', wage: '₹600 fixed', location: 'Lajpat Nagar, Delhi', duration: '1 day',
    tags: [], postedById: 'u_grand', postedByRole: ROLE.EMPLOYER, posterRating: 4.6, posterReviews: 18, status: 'open',
    description: 'Diagnose and fix a water pipeline leak in a small retail shop.',
    requirements: ['Quick response, same-day availability'],
    postedAt: '2026-07-01', openings: 1,
  },
  {
    id: 'JOB-2325', title: 'Loading and unloading, warehouse', trade: 'Helper', wage: '₹550–650/day', location: 'Udyog Vihar, Gurugram', duration: '15 days',
    tags: ['Long term'], postedById: 'u_ramesh', postedByRole: ROLE.CONTRACTOR, posterRating: 4.7, posterReviews: 22, status: 'open',
    description: 'Ongoing loading and unloading support at a warehouse — material handling and stock organizing.',
    requirements: ['Physically fit for manual work', 'Available for a longer engagement'],
    postedAt: '2026-06-20', openings: 5,
  },
];
