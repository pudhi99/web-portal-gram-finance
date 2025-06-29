import dbConnect from '@/lib/dbConnect'
import { LoanModel } from '@/models/Loan'
import { notFound } from 'next/navigation'
import { EditLoanForm } from '@/components/loans/EditLoanForm'

async function getLoan(id: string) {
  await dbConnect()
  try {
    const loan = await LoanModel.findById(id).lean()
    if (!loan) {
      return null
    }
    return JSON.parse(JSON.stringify(loan))
  } catch (error) {
    console.error('Failed to fetch loan:', error)
    return null
  }
}

export default async function EditLoanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await dbConnect() // Ensure db connection
  const loan = await getLoan(id)

  if (!loan) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <EditLoanForm loan={loan} />
    </div>
  )
}