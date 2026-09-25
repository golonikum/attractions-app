import { FC } from 'react';
import { Layers, MapPin } from 'lucide-react';

import { YMapControlButton } from '@/lib/ymaps';

export type VisitedFilter = 'all' | 'visited' | 'unvisited';

type VisitedFilterControlProps = {
  value: VisitedFilter;
  onChange: (value: VisitedFilter) => void;
};

export const VisitedFilterControl: FC<VisitedFilterControlProps> = ({ onChange, value }) => (
  <>
    <YMapControlButton onClick={() => onChange('all')}>
      <span title="Все">
        <Layers className={value !== 'all' ? 'opacity-50' : ''} />
      </span>
    </YMapControlButton>
    <YMapControlButton onClick={() => onChange('visited')}>
      <span title="Посещённые">
        <MapPin className={`text-muted-foreground fill-green-100 ${value !== 'visited' ? 'opacity-50' : ''}`} />
      </span>
    </YMapControlButton>
    <YMapControlButton onClick={() => onChange('unvisited')}>
      <span title="Непосещённые">
        <MapPin className={`text-red-500 fill-red-200 ${value !== 'unvisited' ? 'opacity-50' : ''}`} />
      </span>
    </YMapControlButton>
  </>
);
