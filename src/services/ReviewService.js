import { respond } from './http';
import { REVIEWS_FOR_WORKER, REVIEWS_FOR_HIRER, WORKER_RATING_CATS, HIRER_RATING_CATS } from '@/data/reviews';

export const ReviewService = {
  async forWorker() { return respond(REVIEWS_FOR_WORKER); },
  async forHirer() { return respond(REVIEWS_FOR_HIRER); },
  categoriesFor(kind) { return kind === 'worker' ? WORKER_RATING_CATS : HIRER_RATING_CATS; },
  async submit(review) { return respond({ id: `r_${Date.now()}`, ...review }); },
};
