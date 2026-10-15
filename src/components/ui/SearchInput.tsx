import { cn } from '@/lib/utils';

/** Поле поиска в шапке списков; значение хранится в URL (useQueryParams), поэтому поле неуправляемое */
export const SearchInput = ({
  defaultValue,
  onChange,
  className,
}: {
  defaultValue: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <input
    type="text"
    placeholder="Поиск..."
    className={cn(
      'w-full h-10 px-3 py-2 rounded-md border border-input bg-card text-sm placeholder:text-muted-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/60',
      className,
    )}
    defaultValue={defaultValue}
    onChange={(e) => onChange(e.target.value)}
  />
);
