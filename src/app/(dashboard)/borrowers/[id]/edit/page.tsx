'use client'

import { BorrowerForm } from '@/components/borrowers/BorrowerForm'
import { BorrowerFormValues } from '@/lib/validations/borrower'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

async function getBorrowerById(id: string) {
  const res = await fetch(`/api/borrowers/${id}`)
  if (!res.ok) {
    throw new Error('Failed to fetch borrower')
  }
  const data = await res.json()
  return data.data
}

export default function EditBorrowerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [borrower, setBorrower] = useState<
    (BorrowerFormValues & { _id: string }) | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>('')

  // First, resolve the params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  // Then fetch the borrower data when id is available
  useEffect(() => {
    if (!id) return // Don't fetch until id is resolved

    getBorrowerById(id)
      .then((data) => {
        setBorrower(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  if (!borrower) {
    return <div>Borrower not found.</div>
  }

  return (
    <div className="container mx-auto py-10">
      <BorrowerForm initialData={borrower} isEditing={true} />
    </div>
  )
}