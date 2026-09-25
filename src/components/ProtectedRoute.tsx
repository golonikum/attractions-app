'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

import { LoadingStub } from './ui/stubs';
import { Navigation } from './Navigation';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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
