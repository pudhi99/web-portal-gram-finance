import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ILoan } from '@/models/Loan'
import { LoanStatus } from '@/types/loan'
import { IInstallment } from '@/models/Installment'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

type LoanDetails = ILoan & {
  borrower: { name: string; village: string }
  installments: IInstallment[]
}

async function getLoanById(id: string): Promise<LoanDetails | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/loans/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.data
}

const statusColors: Record<LoanStatus, string> = {
  [LoanStatus.ACTIVE]: 'bg-blue-500 hover:bg-blue-600',
  [LoanStatus.PAID]: 'bg-green-500 hover:bg-green-600',
  [LoanStatus.DEFAULTED]: 'bg-red-500 hover:bg-red-600',
}

export default async function LoanDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const loan = await getLoanById(params.id)

  if (!loan) {
    notFound()
  }

  const totalPaid = (loan.installments as IInstallment[]).reduce(
    (acc, inst) => acc + (inst.amountPaid || 0),
    0
  )
  const outstanding = loan.principalAmount - totalPaid

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">
                {loan.loanNumber}
              </CardTitle>
              <CardDescription>
                For {loan.borrower.name} ({loan.borrower.village})
              </CardDescription>
            </div>
            <Badge className={`${statusColors[loan.status]} text-white text-lg`}>
              {loan.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <strong>Principal:</strong>{' '}
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(loan.principalAmount)}
          </div>
          <div>
            <strong>Disbursed:</strong>{' '}
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(loan.disbursedAmount)}
          </div>
          <div>
            <strong>Outstanding:</strong>{' '}
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(outstanding)}
          </div>
          <div>
            <strong>Term:</strong> {loan.termWeeks} weeks
          </div>
          <div>
            <strong>Start Date:</strong> {format(new Date(loan.startDate), 'PPP')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loan.installments as IInstallment[]).map((inst) => (
                <TableRow key={inst._id as string}>
                  <TableCell>{inst.installmentNumber}</TableCell>
                  <TableCell>{format(new Date(inst.dueDate), 'PPP')}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    }).format(inst.amountDue)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    }).format(inst.amountPaid)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inst.status === 'PAID' ? 'default' : 'destructive'
                      }
                    >
                      {inst.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inst.paymentDate
                      ? format(new Date(inst.paymentDate), 'PPP')
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 