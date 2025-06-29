'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { CollectionListItem } from '@/types/collection';
import Link from 'next/link';

export const columns: ColumnDef<CollectionListItem>[] = [
  {
    accessorKey: 'installmentId.installmentNumber',
    id: 'installmentNumber',
    header: 'Installment #',
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          #{row.getValue('installmentNumber')}
        </div>
      );
    },
  },
  {
    accessorKey: 'collectorId.name',
    id: 'collector',
    header: 'Collector',
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">{row.getValue('collector')}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.collectorId.email}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'paymentDate',
    header: 'Payment Date',
    cell: ({ row }) => {
      return (
        <div>
          {format(new Date(row.getValue('paymentDate')), 'MMM dd, yyyy')}
        </div>
      );
    },
  },
  {
    accessorKey: 'installmentId.dueDate',
    id: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => {
      return (
        <div>
          {format(new Date(row.original.installmentId.dueDate), 'MMM dd, yyyy')}
        </div>
      );
    },
  },
  {
    accessorKey: 'installmentId.status',
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.installmentId.status;
      return (
        <Badge
          variant={
            status === 'PAID'
              ? 'default'
              : status === 'PARTIAL'
              ? 'secondary'
              : status === 'OVERDUE'
              ? 'destructive'
              : 'outline'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const collection = row.original;

      const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this collection?')) {
          try {
            const response = await fetch(`/api/collections/${collection._id}`, {
              method: 'DELETE',
            });
            
            if (response.ok) {
              // Refresh the page to update the table
              window.location.reload();
            } else {
              const errorData = await response.json();
              alert(`Failed to delete collection: ${errorData.error}`);
            }
          } catch (error) {
            console.error('Error deleting collection:', error);
            alert('Failed to delete collection');
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/collections/${collection._id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/collections/${collection._id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Collection
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 