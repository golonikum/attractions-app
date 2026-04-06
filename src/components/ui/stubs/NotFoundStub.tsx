export const NotFoundStub = ({ message = 'Ничего не найдено' }: { message?: string }) => (
  <div className="container mx-auto pt-20 px-4 pb-8">
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold">{message}</h3>
    </div>
  </div>
);
