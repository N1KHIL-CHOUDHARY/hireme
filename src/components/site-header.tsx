'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useHeaderTitle } from '@/provider/_header-title-provider';

export function SiteHeader() {
  const { title } = useHeaderTitle();
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-white px-4">
      <div className="flex w-full items-center gap-2">
        <SidebarTrigger className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" />
        <Separator orientation="vertical" className="h-4 bg-border" />
        <span className="text-sm font-medium text-slate-700">{title}</span>
      </div>
    </header>
  );
}
