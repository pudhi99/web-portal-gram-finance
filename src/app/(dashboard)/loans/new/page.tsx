import { LoanForm } from '@/components/loans/LoanForm'
import { IBorrower } from '@/models/Borrower'

async function getBorrowers(): Promise<(IBorrower & { _id: string })[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/borrowers`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    return []
  }
  const data = await res.json()
  return data.data
}

export default async function NewLoanPage() {
  const borrowers = await getBorrowers()

  return (
    <div className="container mx-auto py-10">
      <LoanForm borrowers={borrowers} />
    </div>
  )
} 