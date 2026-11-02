'use client';

import { Bookmark, Compass, FileText, LogOut, Menu, Sparkles, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import * as React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CandidateNavbarProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

const NAV_ITEMS = [
  {
    label: 'Explore Jobs',
    href: '/dashboard/jobs',
    icon: Compass,
    match: (path: string) => path === '/dashboard/jobs' || path.startsWith('/dashboard/jobs/'),
  },
  {
    label: 'Applications',
    href: '/dashboard/applications',
    icon: FileText,
    match: (path: string) => path.startsWith('/dashboard/applications'),
  },
  {
    label: 'Saved Jobs',
    href: '/dashboard/saved-jobs',
    icon: Bookmark,
    match: (path: string) => path.startsWith('/dashboard/saved-jobs'),
  },
  {
    label: 'AI Interviews',
    href: '/dashboard/interviews',
    icon: Sparkles,
    match: (path: string) => path.startsWith('/dashboard/interviews'),
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    match: (path: string) => path.startsWith('/dashboard/profile'),
  },
];

export function CandidateNavbar({ user }: CandidateNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'C';
    const names = name.trim().split(/\s+/);
    if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard/jobs"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0"
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 border border-blue-100">
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
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  Candidate Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.match(pathname);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-100/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: User Dropdown & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* User Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2.5 pl-2 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  >
                    <Avatar className="h-7 w-7 rounded-full border border-slate-200">
                      <AvatarFallback className="bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col text-left leading-none">
                      <span className="text-xs font-medium text-slate-900 truncate max-w-[120px]">
                        {user.name || 'Candidate'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">Candidate</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-md"
                  align="end"
                  sideOffset={6}
                >
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/profile"
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/saved-jobs"
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                      <span>Saved Jobs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/applications"
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>My Applications</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-8 w-8 text-slate-600 border-slate-200"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-2 pb-4 space-y-1 shadow-sm animate-in slide-in-from-top-2 duration-150">
          {NAV_ITEMS.map((item) => {
            const isActive = item.match(pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-100/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
