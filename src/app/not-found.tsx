export default function NotFound() {
  return (
    <div
      className="flex items-center justify-center bg-background"
      style={{ minHeight: 'calc(50vh - 4rem)' }}
    >
      <main className="w-full max-w-xl p-6 text-center flex flex-col items-center justify-center h-full">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl">
          <span aria-hidden>😕</span>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">We couldn't find the page you're looking for.</p>

        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go back home
          </a>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">If you think this is an error, try refreshing or contact support.</p>
      </main>
    </div>
  );
}
