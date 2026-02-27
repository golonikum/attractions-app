'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '../button';

export const BackButton = ({ route }: { route?: string }) => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (route) {
          router.push(route);
        } else {
          router.back();
        }
      }}
      className="mr-4 cursor-pointer"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Назад
    </Button>
  );
};
