'use client';

import { IconDashboard } from '@tabler/icons-react';
import { BriefcaseIcon, Heart, User2Icon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain() {
  const session = useSession();
  const user = session.data?.user;
  const role = user?.role;
  const pathname = usePathname();

  const adminMenu = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Jobs',
      url: '/dashboard/manage-jobs',
      icon: BriefcaseIcon,
    },
    {
      title: 'Candidates',
      url: '/dashboard/candidates',
      icon: UserIcon,
    },
    {
      title: 'Recruiters',
      url: '/dashboard/recruiters',
      icon: User2Icon,
    },
    {
      title: 'Wishlist',
      url: '/dashboard/wishlist',
      icon: Heart,
    },
    {
      title: 'Contact Submissions',
      url: '/dashboard/contact-submissions',
      icon: UserIcon,
    },
  ];

  const recruiterMenu = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Jobs',
      url: '/dashboard/job-listing',
      icon: BriefcaseIcon,
    },
    {
      title: 'Job Applications',
      url: '/dashboard/job-applications',
      icon: UserIcon,
    },
  ];

  const userMenu = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Jobs',
      url: '/dashboard/jobs',
      icon: BriefcaseIcon,
    },
    {
      title: 'Applications',
      url: '/dashboard/applications',
      icon: UserIcon,
    },
  ];

  const menu = role === 'admin' ? adminMenu : role === 'recruiter' ? recruiterMenu : userMenu;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1 px-1">
        <SidebarMenu>
          {menu.map((item) => {
            const isActive =
              item.url === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.url || pathname.startsWith(item.url + '/');

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={`cursor-pointer rounded-md transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-primary font-medium border border-blue-100/60'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon className="size-4 shrink-0" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
