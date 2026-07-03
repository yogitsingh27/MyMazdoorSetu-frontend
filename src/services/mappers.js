// Maps backend DTOs (see backend docs/API.md) to the legacy nested shapes the
// existing components already consume, so the API swap needs no layout changes.

const AVATAR_COLORS = ['amber', 'navy', 'teal'];

// Deterministic on-brand avatar color from a name — used for employers, whose
// detail DTO carries no avatarColor.
export function deriveAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ISO date -> "14 Jun" (matches the previous mock review date format).
export function formatReviewDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function mapJobSummary(dto) {
  return {
    id: dto.code,
    title: dto.title,
    trade: dto.trade,
    wage: dto.wage,
    location: dto.location,
    duration: dto.duration,
    postedByRole: dto.postedByRole,
    posterRating: dto.posterRating,
    posterReviews: dto.posterReviewCount,
    tags: dto.tags ?? [],
    status: 'open',
  };
}

export function mapJobDetail(dto) {
  return {
    id: dto.code,
    title: dto.title,
    trade: dto.trade,
    wage: dto.wage,
    location: dto.location,
    duration: dto.duration,
    description: dto.description,
    status: dto.status,
    openings: dto.openings,
    postedAt: dto.postedAt,
    requirements: dto.requirements ?? [],
    tags: dto.tags ?? [],
    postedByRole: dto.poster.role,
    posterRating: dto.poster.rating,
    posterReviews: dto.poster.reviewCount,
    poster: {
      id: dto.poster.id,
      name: dto.poster.displayName,
      role: dto.poster.role,
      kind: dto.poster.kind,
      verified: dto.poster.verified,
      avatarColor: dto.poster.avatarColor,
    },
    similar: (dto.similar ?? []).map(mapJobSummary),
  };
}

export function mapReview(dto) {
  return {
    id: dto.id,
    by: dto.authorName,
    role: dto.authorLabel,
    date: formatReviewDate(dto.date),
    overall: dto.overall,
    verified: dto.verified,
    comment: dto.comment,
    cats: Object.fromEntries((dto.categories ?? []).map((c) => [c.category, c.score])),
  };
}

export function mapWorkerSummary(dto) {
  return {
    id: dto.id,
    name: dto.name,
    avatarColor: dto.avatarColor,
    city: dto.city,
    verified: dto.verified,
    workerProfile: {
      trade: dto.trade,
      rating: dto.rating,
      jobsDone: dto.jobsDone,
      skills: dto.skills ?? [],
    },
  };
}

export function mapWorkerDetail(dto) {
  return {
    id: dto.id,
    name: dto.name,
    avatarColor: dto.avatarColor,
    city: dto.city,
    verified: dto.verified,
    languages: dto.languages ?? [],
    workerProfile: {
      trade: dto.trade,
      rating: dto.rating,
      availability: dto.availability,
      jobsDone: dto.jobsDone,
      experienceYears: dto.experienceYears,
      skills: dto.skills ?? [],
      portfolio: dto.portfolio ?? [],
    },
    reviews: (dto.reviews ?? []).map(mapReview),
    similar: (dto.similar ?? []).map(mapWorkerSummary),
  };
}

export function mapEmployerDetail(dto) {
  return {
    id: dto.id,
    city: dto.city,
    verified: dto.verified,
    avatarColor: deriveAvatarColor(dto.orgName),
    employerProfile: {
      orgName: dto.orgName,
      kind: dto.kind,
      tagline: dto.tagline,
      rating: dto.rating,
      jobsPosted: dto.jobsPosted,
    },
    reviews: (dto.reviews ?? []).map(mapReview),
    openJobs: (dto.openJobs ?? []).map(mapJobSummary),
  };
}
