'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CheckCircle, Eye, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/page-header';

interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isResolved: boolean;
}

export default function ContactSubmissionsPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts', page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/contact?page=${page + 1}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
  });

  const handleToggleResolved = async (contactId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isResolved: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete contact');
    },
  });

  const handleDelete = (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteMutation.mutate(contactToDelete);
    }
  };

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'name',
      header: 'Sender Name',
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        return <span className="font-medium text-slate-900">{name}</span>;
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
      accessorKey: 'message',
      header: 'Message Preview',
      cell: ({ row }) => {
        const message = row.getValue('message') as string;
        return (
          <div className="max-w-xs">
            <p className="text-xs text-slate-600 truncate" title={message}>
              {message}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted On',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return (
          <span className="font-mono text-xs tabular-nums text-slate-600">
            {format(new Date(date), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      accessorKey: 'isResolved',
      header: 'Resolution Status',
      cell: ({ row }) => {
        const isResolved = row.getValue('isResolved') as boolean;
        return (
          <Badge
            variant="outline"
            className={
              isResolved
                ? 'bg-green-50 text-green-700 border-green-200 text-xs font-normal'
                : 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-normal'
            }
          >
            <span
              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                isResolved ? 'bg-green-600' : 'bg-amber-500'
              }`}
            />
            {isResolved ? 'Resolved' : 'Pending'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex items-center justify-end space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
              onClick={() => setSelectedContact(contact)}
              title="View full message"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                contact.isResolved
                  ? 'text-slate-400 hover:text-slate-700'
                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
              }`}
              onClick={() => handleToggleResolved(contact._id, contact.isResolved)}
              title={contact.isResolved ? 'Mark as pending' : 'Mark as resolved'}
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(contact._id)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Delete submission"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contact Form Submissions"
          description="Manage and respond to user messages and inquiries"
        />
        <Card className="p-6 border-red-200 bg-red-50/50 text-red-700">
          <p className="text-sm font-medium">Failed to load contact submissions</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Form Submissions"
        description="Review, respond to, and resolve user inquiries and support submissions"
      />

      <Card className="p-4 sm:p-6 bg-white border-slate-200 shadow-sm">
        <DataTable
          columns={columns}
          data={data?.contacts || []}
          searchKey="name"
          searchPlaceholder="Search by sender name..."
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

      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="bg-white border-slate-200 max-w-lg">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-lg font-bold tracking-tight text-slate-900">
              Message from {selectedContact?.name}
            </DialogTitle>
            <p className="text-xs font-mono text-slate-500 tabular-nums">
              {selectedContact?.email}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {selectedContact?.message}
            </div>
            {selectedContact?.createdAt && (
              <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                Submitted on {format(new Date(selectedContact.createdAt), 'PPP p')}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900">
              Delete Contact Submission?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              This action cannot be undone. This will permanently remove the submission record from
              the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
