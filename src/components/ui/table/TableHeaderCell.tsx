import { FC } from 'react';

import { cn } from '@/lib/utils';

import { TableColumnConfig } from './types';

export const TableHeaderCell: FC<{ className?: string; column: TableColumnConfig }> = ({ className, column }) => (
  <div
    className={cn(
      'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shrink-0',
      !column.width && 'flex-1',
      className,
    )}
    style={{ width: `${column.width}px` }}
  >
    {column.label}
  </div>
);
