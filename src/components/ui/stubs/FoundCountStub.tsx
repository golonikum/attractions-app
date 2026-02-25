export const FoundCountStub = ({
  count,
  hasFilters,
}: {
  count: number;
  hasFilters?: boolean;
}) => (
  <div className="flex-1 shrink-0">
    {hasFilters ? "Найдено" : "Всего"}{" "}
    <span className={count ? "font-bold" : ""}>{count}</span>
  </div>
);
