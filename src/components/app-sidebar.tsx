'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="bg-white border-r border-border" {...props}>
      <SidebarHeader className="border-b border-border/60 p-3">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:hidden hover:opacity-90 transition-opacity"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 border border-blue-100">
              <Image
                src="/images/hirelytics-logo.svg"
                alt="Hirelytics Logo"
                width={18}
                height={18}
                className="size-4.5"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight text-slate-900 leading-tight truncate">
                Hirelytics
              </span>
              <span className="text-[11px] text-slate-400 font-normal leading-tight">
                AI Recruitment
              </span>
            </div>
          </Link>
          <SidebarTrigger className="size-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" />
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/60 p-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
