import { FC, PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

import { TableHeaderCell } from './TableHeaderCell';

import { TableColumnConfig } from './types';

export const Table: FC<PropsWithChildren<{ columns: TableColumnConfig[]; className?: string }>> = ({
  columns,
  children,
  className,
}) => (
  <div className={cn('h-full overflow-auto flex flex-col width-fit', className)}>
    <div className="bg-gray-50 h-8 flex sticky top-0 z-10 border-b-1 border-gray-200">
      {columns.map((column) => (
        <TableHeaderCell column={column} key={column.label} />
      ))}
    </div>
    {children}
  </div>
);
