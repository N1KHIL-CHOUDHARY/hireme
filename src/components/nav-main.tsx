'use client';

import { IconDashboard } from '@tabler/icons-react';
import {
  Bookmark,
  Briefcase,
  Building2,
  Compass,
  FileText,
  Heart,
  PlusCircle,
  Sparkles,
  User,
  User2,
  Users,
  Video,
} from 'lucide-react';
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
      icon: Briefcase,
    },
    {
      title: 'Candidates',
      url: '/dashboard/candidates',
      icon: User,
    },
    {
      title: 'Recruiters',
      url: '/dashboard/recruiters',
      icon: User2,
    },
    {
      title: 'Wishlist',
      url: '/dashboard/wishlist',
      icon: Heart,
    },
    {
      title: 'Contact Submissions',
      url: '/dashboard/contact-submissions',
      icon: User,
    },
  ];

  const recruiterMenu = [
    {
      title: 'Overview',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'My Jobs',
      url: '/dashboard/job-listing',
      icon: Briefcase,
    },
    {
      title: 'Post a Job',
      url: '/dashboard/job-listing?action=new',
      icon: PlusCircle,
    },
    {
      title: 'Applicants',
      url: '/dashboard/job-applications',
      icon: Users,
    },
    {
      title: 'Interviews',
      url: '/dashboard/recruiter/interviews',
      icon: Video,
    },
    {
      title: 'Company Profile',
      url: '/dashboard/company-profile',
      icon: Building2,
    },
  ];

  const candidateMenu = [
    {
      title: 'Explore Jobs',
      url: '/dashboard/jobs',
      icon: Compass,
    },
    {
      title: 'Applications',
      url: '/dashboard/applications',
      icon: FileText,
    },
    {
      title: 'Saved Jobs',
      url: '/dashboard/saved-jobs',
      icon: Bookmark,
    },
    {
      title: 'AI Interviews',
      url: '/dashboard/interviews',
      icon: Sparkles,
    },
    {
      title: 'Profile',
      url: '/dashboard/profile',
      icon: User,
    },
  ];

  const menu = role === 'admin' ? adminMenu : role === 'recruiter' ? recruiterMenu : candidateMenu;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1 px-1">
        <SidebarMenu>
          {menu.map((item) => {
            const baseUrl = item.url.split('?')[0];
            const isActive =
              baseUrl === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === baseUrl || pathname.startsWith(baseUrl + '/');

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
