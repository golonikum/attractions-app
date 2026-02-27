export const GroupTableCellDescription = ({ description }: { description?: string }) => (
  <div className="flex items-center gap-4">
    {description?.split(', ').map((item, index) => (
      <div key={index} className={`flex items-center justify-end gap-2 ${index === 1 ? 'w-24' : 'w-16'}`}>
        {item}
      </div>
    ))}
  </div>
);
