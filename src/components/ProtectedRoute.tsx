'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { useIsHydrated } from '@/hooks/useIsHydrated';

import { LoadingStub } from './ui/stubs';
import { Navigation } from './Navigation';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  // На медленных устройствах /api/auth успевает ответить раньше, чем гидратируется этот сегмент:
  // без этой проверки клиент рисует контент вместо серверного LoadingStub, React ловит hydration
  // mismatch и перерисовывает всё дерево — страница мигает, сбрасывается прокрутка списков
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !isHydrated) {
    return <LoadingStub />;
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
