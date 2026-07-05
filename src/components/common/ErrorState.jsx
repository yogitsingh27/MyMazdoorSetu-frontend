import EmptyState from './EmptyState';

// Inline state for a data fetch that errored — a friendly message with an
// optional retry, so a failed load shows a real error (not a misleading
// "nothing here" empty state) and never crashes the page.
export default function ErrorState({
  onRetry,
  title = "Couldn't load this",
  hint = 'Something went wrong while loading. Please check your connection and try again.',
}) {
  return (
    <EmptyState
      icon="alert"
      title={title}
      hint={hint}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}
