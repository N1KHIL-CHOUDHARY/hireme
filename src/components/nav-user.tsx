'use client';

import { IconDotsVertical, IconLogout } from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavUser() {
  const { isMobile } = useSidebar();

  const session = useSession();
  const user = session.data?.user;

  if (!user) {
    return null;
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.trim().split(/\s+/);
    if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-slate-100 transition-colors"
            >
              <Avatar className="h-8 w-8 rounded-md border border-slate-200">
                <AvatarFallback className="rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-slate-900">{user.name}</span>
                <span className="truncate font-mono text-xs text-slate-500">{user.email}</span>
              </div>
              <IconDotsVertical className="ml-auto size-4 text-slate-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-md"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-md border border-slate-200">
                  <AvatarFallback className="rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-slate-900">{user.name}</span>
                  <span className="truncate font-mono text-xs text-slate-500">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-red-600 focus:bg-slate-100 focus:text-red-600"
            >
              <IconLogout className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
