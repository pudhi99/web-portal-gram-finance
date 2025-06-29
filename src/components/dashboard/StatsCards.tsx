'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Users,
  Landmark,
  PiggyBank,
  Wallet,
  HandCoins,
  CircleHelp,
} from 'lucide-react'

interface Stats {
  totalBorrowers: number
  totalPrincipal: number
  activeLoans: number
  outstandingAmount: number
}

interface StatsCardsProps {
  stats: Stats
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      title: 'Total Principal Disbursed',
      value: formatCurrency(stats.totalPrincipal),
      description: 'Total amount loaned to all borrowers.',
      icon: <Landmark className="h-6 w-6 text-gray-500" />,
    },
    {
      title: 'Total Outstanding Amount',
      value: formatCurrency(stats.outstandingAmount),
      description: 'Total amount yet to be collected.',
      icon: <Wallet className="h-6 w-6 text-gray-500" />,
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans,
      description: 'Number of loans currently in repayment.',
      icon: <HandCoins className="h-6 w-6 text-gray-500" />,
    },
    {
      title: 'Total Borrowers',
      value: stats.totalBorrowers,
      description: 'Total number of unique borrowers registered.',
      icon: <Users className="h-6 w-6 text-gray-500" />,
    },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 