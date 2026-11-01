'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useHeaderTitle } from '@/provider/_header-title-provider';

export function SiteHeader() {
  const { title } = useHeaderTitle();
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-white px-4">
      <div className="flex w-full items-center gap-2">
        {/* Mobile-only toggle so mobile users can open the drawer */}
        <SidebarTrigger className="md:hidden size-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors -ml-1" />
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
    </header>
  );
}
