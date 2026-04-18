import { ComponentType } from 'react';
import { DividerProps } from 'react-split-pane';
import { GripVertical } from 'lucide-react';

export const CustomDivider: ComponentType<DividerProps> = ({
  children,
  isDragging,
  currentSize,
  minSize,
  maxSize,
  ...props
}) => (
  <div
    {...props}
    className={`
        flex items-center justify-center
        transition-all duration-200 ease-out
        cursor-col-resize
        select-none user-select-none
        group
      `}
    style={{
      ...props.style,
      width: '16px',
      height: '100%',
    }}
  >
    <GripVertical className="opacity-20 group-hover:opacity-100" />
  </div>
);
