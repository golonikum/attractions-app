import { MapPin } from 'lucide-react';

export const LoadingPinStub = () => (
  <div className="container mx-auto pt-20 px-4 pb-8">
    <div className="flex justify-center items-center h-64">
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
        <MapPin
          aria-hidden
          className="size-12 text-primary fill-primary/15 animate-bounce motion-reduce:animate-none"
        />
        <div
          aria-hidden
          className="-mt-2 h-1.5 w-8 rounded-full bg-primary/25 blur-[1px] animate-pulse motion-reduce:animate-none"
        />
        <span className="text-sm text-muted-foreground">Загрузка…</span>
      </div>
    </div>
  </div>
);
