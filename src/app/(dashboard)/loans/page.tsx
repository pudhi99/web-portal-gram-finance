'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/borrowers/data-table'
import { getLoanColumns } from '@/components/loans/columns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PopulatedLoan } from '@/types/loan'

async function getLoans(): Promise<PopulatedLoan[]> {
  const res = await fetch('/api/loans', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  const data = await res.json()
  return data.data
}

export default function LoansPage() {
  const [data, setData] = useState<PopulatedLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null)

  const fetchLoans = async () => {
    setLoading(true)
    try {
      const loans = await getLoans()
      setData(loans)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  const handleDelete = async () => {
    if (!loanToDelete) return
    try {
      await fetch(`/api/loans/${loanToDelete}`, { method: 'DELETE' })
      setLoanToDelete(null)
      fetchLoans() // Refresh data
    } catch (error) {
      console.error(error)
    }
  }

  const columns = getLoanColumns((loanId) => setLoanToDelete(loanId))

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Loan Management</h1>
        <Link href="/loans/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Loan
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumnId="borrowerName"
      />
      <AlertDialog open={!!loanToDelete} onOpenChange={() => setLoanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the loan and all its installments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 