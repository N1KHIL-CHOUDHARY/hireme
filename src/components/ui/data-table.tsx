'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  isLoading = false,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(pagination
        ? {
            pagination: {
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            },
          }
        : {}),
    },
    ...(pagination
      ? {
          manualPagination: true,
          pageCount: pagination.pageCount,
        }
      : {}),
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex justify-center items-center gap-2 text-slate-500">
                    <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm font-medium">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-slate-500 text-sm"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          {pagination
            ? `Page ${pagination.pageIndex + 1} of ${Math.max(1, pagination.pageCount)}`
            : `Page ${table.getState().pagination.pageIndex + 1} of ${Math.max(1, table.getPageCount())}`}
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={
              pagination?.pageSize.toString() || table.getState().pagination.pageSize.toString()
            }
            onValueChange={(value) => {
              if (pagination) {
                pagination.onPageSizeChange(Number(value));
              } else {
                table.setPageSize(Number(value));
              }
            }}
          >
            <SelectTrigger className="h-8 w-[72px] text-xs font-mono tabular-nums bg-white">
              <SelectValue
                placeholder={
                  pagination?.pageSize.toString() || table.getState().pagination.pageSize.toString()
                }
              />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 50].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="text-xs font-mono tabular-nums"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="size-8 p-0"
            onClick={() => {
              if (pagination) {
                pagination.onPageChange(pagination.pageIndex - 1);
              } else {
                table.previousPage();
              }
            }}
            disabled={pagination ? pagination.pageIndex === 0 : !table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="size-8 p-0"
            onClick={() => {
              if (pagination) {
                pagination.onPageChange(pagination.pageIndex + 1);
              } else {
                table.nextPage();
              }
            }}
            disabled={
              pagination
                ? pagination.pageIndex >= pagination.pageCount - 1
                : !table.getCanNextPage()
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
