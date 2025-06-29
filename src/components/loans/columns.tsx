'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { PopulatedLoan, LoanStatus } from '@/types/loan'

const statusColors: Record<LoanStatus, string> = {
  [LoanStatus.ACTIVE]: 'bg-blue-500 hover:bg-blue-600',
  [LoanStatus.PAID]: 'bg-green-500 hover:bg-green-600',
  [LoanStatus.DEFAULTED]: 'bg-red-500 hover:bg-red-600',
}

export const getLoanColumns = (
  onDelete: (loanId: string) => void
): ColumnDef<PopulatedLoan>[] => [
  {
    accessorKey: 'loanNumber',
    header: 'Loan #',
  },
  {
    id: 'borrowerName',
    accessorKey: 'borrower.name',
    header: 'Borrower',
  },
  {
    accessorKey: 'disbursedAmount',
    header: () => <div className="text-right">Disbursed</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('disbursedAmount'))
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'outstandingAmount',
    header: () => <div className="text-right">Outstanding</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('outstandingAmount'))
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as LoanStatus
      return (
        <Badge className={`${statusColors[status]} text-white`}>{status}</Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const loan = row.original
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
            <DropdownMenuItem>
              <Link href={`/loans/${loan._id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/loans/${loan._id}/edit`}>Edit Loan</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(loan._id)}
            >
              Delete Loan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 