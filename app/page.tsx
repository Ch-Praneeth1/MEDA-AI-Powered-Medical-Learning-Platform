'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-slate-900 to-blue-900">
      <div className="text-white text-xl">Redirecting...</div>
    </div>
  );
}


