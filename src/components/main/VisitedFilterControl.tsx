import { FC } from 'react';
import { Layers, LucideIcon, MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';
import { YMapControlButton } from '@/lib/ymaps';

import { MARKER_PIN_STYLES } from '../ui/MarkerPin';

export type VisitedFilter = 'all' | 'visited' | 'unvisited';

type VisitedFilterControlProps = {
  value: VisitedFilter;
  onChange: (value: VisitedFilter) => void;
};

const OPTIONS: { value: VisitedFilter; title: string; Icon: LucideIcon; className?: string }[] = [
  { value: 'all', title: 'Все', Icon: Layers },
  { value: 'visited', title: 'Посещённые', Icon: MapPin, className: MARKER_PIN_STYLES.visited },
  { value: 'unvisited', title: 'Непосещённые', Icon: MapPin, className: MARKER_PIN_STYLES.unvisited },
];

export const VisitedFilterControl: FC<VisitedFilterControlProps> = ({ onChange, value }) => (
  <>
    {OPTIONS.map(({ value: optionValue, title, Icon, className }) => (
      <YMapControlButton key={optionValue} onClick={() => onChange(optionValue)}>
        <span title={title}>
          <Icon className={cn(className, value !== optionValue && 'opacity-30')} />
        </span>
      </YMapControlButton>
    ))}
  </>
);
