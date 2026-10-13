export default function Loading() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-dot" aria-hidden="true" />
      Loading…
    </div>
  );
}
