'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ILoan, LoanStatus } from '@/types/loan'
import { IBorrower } from '@/models/Borrower'

type PopulatedLoan = Omit<ILoan, 'borrowerId' | 'startDate'> & {
  borrower: IBorrower
  startDate: Date
}

interface RecentLoansProps {
  loans: PopulatedLoan[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function RecentLoans({ loans }: RecentLoansProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Loans</CardTitle>
        <CardDescription>
          The 5 most recently created loans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Borrower</TableHead>
              <TableHead>Village</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length > 0 ? (
              loans.map((loan, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {loan.borrower.name}
                  </TableCell>
                  <TableCell>{loan.borrower.village}</TableCell>
                  <TableCell>{formatCurrency(loan.principalAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        loan.status === LoanStatus.ACTIVE
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(loan.startDate)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No recent loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 