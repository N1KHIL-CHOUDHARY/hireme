'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Mail, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';

interface WishlistEntry {
  id: string;
  name: string;
  email: string;
  reason?: string;
  createdAt: string;
}

export default function AdminWishlistPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch wishlist data
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-wishlist', page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist?page=${page + 1}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist entries');
      }
      return response.json();
    },
  });

  // Define columns for the data table
  const columns: ColumnDef<WishlistEntry>[] = [
    {
      accessorKey: 'name',
      header: 'Prospective User',
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
              <User className="h-4 w-4" />
            </div>
            <span className="font-medium text-slate-900">{name}</span>
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
      accessorKey: 'reason',
      header: 'Interest / Notes',
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string;
        return reason ? (
          <div className="max-w-xs">
            <p className="text-xs text-slate-600 truncate" title={reason}>
              {reason}
            </p>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="text-[11px] font-normal text-slate-400 border-slate-200"
          >
            No note provided
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined Date',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return (
          <span className="font-mono text-xs tabular-nums text-slate-600">
            {format(new Date(date), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Wishlist Inquiries"
          description="Manage and review prospective platform users and waitlist requests"
        />
        <Card className="p-6 border-red-200 bg-red-50/50 text-red-700">
          <p className="text-sm font-medium">Failed to load wishlist entries</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wishlist Inquiries"
        description="Review waitlist entries from prospective candidates and recruiters"
      />

      <Card className="p-4 sm:p-6 bg-white border-slate-200 shadow-sm">
        <DataTable
          columns={columns}
          data={data?.wishlistEntries || []}
          searchKey="name"
          searchPlaceholder="Search by name, email, or reason..."
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
    </div>
  );
}
