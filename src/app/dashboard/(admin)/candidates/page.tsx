'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Mail, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { UserDetails } from '@/components/admin/user-details';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { PageHeader } from '@/components/ui/page-header';
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

export default function CandidatesPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery] = useState('');

  // Fetch users with role filter, pagination, and search
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['candidates', page, pageSize, searchQuery],
    queryFn: async () => {
      const searchParam = searchQuery ? `&search=${searchQuery}` : '';
      const response = await fetch(
        `/api/admin/users?page=${page + 1}&limit=${pageSize}&role=candidate${searchParam}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      return response.json();
    },
  });

  // Define columns for the data table
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Candidate Name',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
              <UserIcon className="h-4 w-4" />
            </div>
            <span className="font-medium text-slate-900">{user.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      cell: ({ row }) => {
        const email = row.getValue('email') as string;
        return (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-mono tabular-nums">{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as UserRole;
        return (
          <Badge
            variant="secondary"
            className="text-xs font-normal bg-slate-100 text-slate-700 border-slate-200 capitalize"
          >
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Account Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return <StatusBadge status={isActive ? 'active' : 'inactive'} />;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Registered On',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return (
          <span className="font-mono text-xs tabular-nums text-slate-600">
            {format(date, 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => {
                setSelectedUser(user);
                setIsDrawerOpen(true);
              }}
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              View Details
            </Button>
          </div>
        );
      },
    },
  ];

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user status');
      }

      refetch();
      toast.success(`User ${isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Directory"
        description="View and manage registered candidate profiles and account permissions"
      />

      <Card className="p-4 sm:p-6 bg-white border-slate-200 shadow-sm">
        <DataTable
          columns={columns}
          data={data?.users || []}
          searchKey="name"
          searchPlaceholder="Search candidates by name..."
          pagination={{
            pageIndex: page,
            pageSize: pageSize,
            pageCount: data?.pagination?.totalPages || 1,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
          isLoading={isLoading}
        />
      </Card>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh] overflow-auto bg-white border-slate-200">
          {selectedUser && (
            <UserDetails
              user={selectedUser}
              onToggleStatus={handleToggleUserStatus}
              onClose={() => setIsDrawerOpen(false)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
