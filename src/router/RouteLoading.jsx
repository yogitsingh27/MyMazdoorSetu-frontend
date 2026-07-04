import { PageSkeleton } from '@/components/common/Skeleton';

/**
 * Shown by the route guards while the auth session is being restored on load
 * (API mode exchanges the httpOnly refresh cookie for a token asynchronously).
 * Keeps protected routes from flashing the login page before we know whether
 * the user is already signed in.
 */
export default function RouteLoading() {
  return (
    <div className="section">
      <PageSkeleton stats={false} />
    </div>
  );
}
