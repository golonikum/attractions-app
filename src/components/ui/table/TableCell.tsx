import { FC, PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

import { TableColumnConfig } from './types';

export const TableCell: FC<PropsWithChildren<{ className?: string; column: TableColumnConfig }>> = ({
  className,
  column,
  children,
}) => (
  <div
    className={cn('px-4 py-2 flex items-center shrink-0', !column.width && 'flex-1', className)}
    style={{ width: `${column.width}px` }}
  >
    {children}
  </div>
);
