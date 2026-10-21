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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="bg-white border-r border-border" {...props}>
      <SidebarHeader className="border-b border-border/60 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="hover:bg-slate-50 transition-colors">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 border border-blue-100">
                  <Image
                    src="/images/hirelytics-logo.svg"
                    alt="Hirelytics Logo"
                    width={18}
                    height={18}
                    className="size-4.5"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
                    Hirelytics
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal leading-tight">
                    AI Recruitment
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
