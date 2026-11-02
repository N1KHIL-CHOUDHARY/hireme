'use client';

import { format } from 'date-fns';
import { Calendar, Mail, Shield, User as UserIcon } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { StatusBadge } from '@/components/ui/status-badge';
import { UserRole } from '@/models/user';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

interface UserDetailsProps {
  user: User;
  onToggleStatus: (userId: string, isActive: boolean) => Promise<void>;
  onClose: () => void;
}

export function UserDetails({ user, onToggleStatus, onClose }: UserDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      await onToggleStatus(user.id, user.isActive);
      onClose();
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
      <DrawerHeader className="px-0 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <DrawerTitle className="text-xl font-bold tracking-tight text-slate-900">
              {user.name}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-slate-500 font-mono tabular-nums">
              {user.email}
            </DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Shield className="h-3.5 w-3.5 text-slate-400" />
            <span>Assigned Role</span>
          </div>
          <div>
            <Badge
              variant="secondary"
              className="text-xs font-normal bg-slate-100 text-slate-700 border-slate-200 capitalize"
            >
              {user.role}
            </Badge>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>Account Status</span>
          </div>
          <div>
            <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span>Contact Email</span>
          </div>
          <p className="text-xs font-mono tabular-nums text-slate-800 truncate">{user.email}</p>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Registration Date</span>
          </div>
          <p className="text-xs font-mono tabular-nums text-slate-800">
            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>

      <DrawerFooter className="px-0 pt-4 border-t border-slate-100 flex flex-row items-center justify-between">
        <DrawerClose asChild>
          <Button variant="outline" size="sm">
            Close
          </Button>
        </DrawerClose>

        {user.role !== 'admin' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={user.isActive ? 'destructive' : 'default'}
                size="sm"
                disabled={isLoading}
              >
                {user.isActive ? 'Disable Account' : 'Enable Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border-slate-200">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-semibold text-slate-900">
                  {user.isActive ? 'Disable User Account?' : 'Enable User Account?'}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
                  {user.isActive
                    ? 'Disabling this account will revoke login and platform access until an administrator re-enables it.'
                    : 'Enabling this account will restore access and allow the user to sign in normally.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggleStatus}>
                  {user.isActive ? 'Disable' : 'Enable'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DrawerFooter>
    </div>
  );
}
