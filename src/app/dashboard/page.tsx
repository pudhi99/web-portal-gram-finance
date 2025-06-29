import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentLoans } from '@/components/dashboard/RecentLoans'
import dbConnect from '@/lib/dbConnect'
import { LoanModel } from '@/models/Loan'
import { unstable_noStore as noStore } from 'next/cache'
// Import models registry to ensure all models are registered
import '@/lib/models'

async function getStats() {
  // This is a placeholder for a proper API call with authentication
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/stats`, { cache: 'no-store' })
  if (!res.ok) {
    console.error("Failed to fetch stats")
    return {
      totalBorrowers: 0,
      totalPrincipal: 0,
      activeLoans: 0,
      outstandingAmount: 0,
    }
  }
  const data = await res.json()
  return data.data
}

async function getRecentLoans() {
  await dbConnect()
  const loans = await LoanModel.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('borrower')
    .lean()

  return JSON.parse(JSON.stringify(loans))
}

export default async function DashboardPage() {
  noStore();
  const stats = await getStats()
  const recentLoans = await getRecentLoans()

  return (
    <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            A quick overview of your lending operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/borrowers/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Borrower
            </Link>
          </Button>
          <Button asChild>
            <Link href="/loans/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Loan
            </Link>
          </Button>
        </div>
      </div>
      <StatsCards stats={stats} />
      <RecentLoans loans={recentLoans} />
    </div>
    </div>
  )
} 