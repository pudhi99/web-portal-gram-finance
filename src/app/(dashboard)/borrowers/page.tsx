'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/borrowers/data-table'
import { getColumns } from '@/components/borrowers/columns'
import { IBorrower } from '@/models/Borrower'
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
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

async function getBorrowers(): Promise<IBorrower[]> {
  const res = await fetch('/api/borrowers', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  const data = await res.json()
  return data.data
}

export default function BorrowersPage() {
  const [data, setData] = useState<IBorrower[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowerToDelete, setBorrowerToDelete] = useState<string | null>(null)
  const router = useRouter()

  const fetchBorrowers = async () => {
    setLoading(true)
    try {
      const borrowers = await getBorrowers()
      setData(borrowers)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBorrowers()
  }, [])

  const handleDelete = async () => {
    if (!borrowerToDelete) return
    try {
      const response = await fetch(`/api/borrowers/${borrowerToDelete}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete borrower.')
      }
      setBorrowerToDelete(null)
      fetchBorrowers() // Refresh the data
    } catch (error) {
      console.error(error)
    }
  }

  const columns = getColumns((borrowerId) => setBorrowerToDelete(borrowerId))

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Borrowers</h1>
        <Link href="/borrowers/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Borrower
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} filterColumnId="name" />
      <AlertDialog open={!!borrowerToDelete} onOpenChange={() => setBorrowerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              borrower and all associated data.
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