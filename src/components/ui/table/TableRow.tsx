import { DetailedHTMLProps, FC, HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

export const TableRow: FC<PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>> = ({
  className,
  children,
  ...rest
}) => (
  <div className={cn('flex border-b-1 border-gray-200', className)} {...rest}>
    {children}
  </div>
);
