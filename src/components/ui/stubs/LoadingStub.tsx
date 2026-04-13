import { Loader2 } from 'lucide-react';

export const LoadingStub = () => (
  <div className="container mx-auto pt-20 px-4 pb-8">
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
);
