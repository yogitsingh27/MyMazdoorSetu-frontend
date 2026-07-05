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

// Backend MyApplicationDto (a worker's own application) -> the flat shape the
// existing worker pages consume. `jobId` mirrors `jobCode` because the frontend
// keys jobs by their code.
export function mapMyApplication(dto) {
  return {
    id: dto.id,
    jobId: dto.jobCode,
    jobCode: dto.jobCode,
    jobTitle: dto.jobTitle,
    trade: dto.trade,
    wage: dto.wage,
    jobStatus: dto.jobStatus,
    status: dto.status,
    appliedAt: dto.appliedAt,
    decidedAt: dto.decidedAt ?? null,
    updatedAt: dto.updatedAt,
  };
}

// Backend ApplicantDto (a poster's view of one application to their job) ->
// the flat shape the applicant-management tables consume. `jobId` mirrors
// `jobCode` because the frontend keys jobs by their code.
export function mapApplicant(dto) {
  return {
    id: dto.id,
    applicantId: dto.applicant.id,
    applicantName: dto.applicant.name,
    trade: dto.applicant.trade,
    rating: dto.applicant.rating,
    jobId: dto.jobCode,
    jobCode: dto.jobCode,
    jobTitle: dto.jobTitle,
    postedByRole: dto.postedByRole,
    status: dto.status,
    appliedAt: dto.appliedAt,
    decidedAt: dto.decidedAt ?? null,
    updatedAt: dto.updatedAt,
  };
}

// Backend PostedJobDto (a poster's view of one of their jobs) -> the flat shape
// the "My jobs" table consumes. `id` mirrors `code` (the frontend keys jobs by code).
export function mapPostedJob(dto) {
  return {
    id: dto.code,
    code: dto.code,
    title: dto.title,
    trade: dto.trade,
    status: dto.status,
    openings: dto.openings,
    postedByRole: dto.postedByRole,
    postedAt: dto.postedAt,
    applicationCount: dto.applicationCount,
    pendingCount: dto.pendingCount,
  };
}

// Backend JobDto (create / close / complete response) -> the flat job shape.
export function mapJobWrite(dto) {
  return {
    id: dto.code,
    code: dto.code,
    title: dto.title,
    trade: dto.trade,
    wage: dto.wage,
    location: dto.location,
    duration: dto.duration,
    description: dto.description,
    status: dto.status,
    openings: dto.openings,
    postedByRole: dto.postedByRole,
    postedAt: dto.postedAt,
    tags: dto.tags ?? [],
    requirements: dto.requirements ?? [],
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
