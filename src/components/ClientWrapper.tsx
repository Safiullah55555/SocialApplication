'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore external links
      if (!anchor.href.startsWith(window.location.origin)) return;

      // If same route, don't show spinner
      const currentPath = window.location.pathname;
      const clickedPath = new URL(anchor.href).pathname;
      if (clickedPath === currentPath) return;

      setIsLoading(true);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    // When pathname changes, hide spinner
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-[9999]">
          <LoadingSpinner />
        </div>
      )}
      {children}
    </>
  );
}
