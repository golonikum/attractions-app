export const LoadingStub = () => (
  <div className="container mx-auto pt-20 px-4 pb-8">
    <div className="flex justify-center items-center h-64">
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
        <svg aria-hidden viewBox="0 0 50 50" className="size-12 animate-spinner-rotate motion-reduce:animate-none">
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" className="stroke-muted" />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="90 150"
            className="stroke-primary animate-spinner-arc motion-reduce:animate-none"
          />
        </svg>
        <span className="text-sm text-muted-foreground animate-pulse motion-reduce:animate-none">Загрузка…</span>
      </div>
    </div>
  </div>
);
