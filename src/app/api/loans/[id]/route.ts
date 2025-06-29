import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { LoanModel } from '@/models/Loan'
import Installment from '@/models/Installment'
import mongoose from 'mongoose'
import { ILoan } from '@/models/Loan'
import { IInstallment } from '@/models/Installment'
import { IBorrower } from '@/models/Borrower'
import { updateLoanSchema } from '@/lib/validations/loan'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  await dbConnect()
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid loan ID' }, { status: 400 })
    }
    const loan = await LoanModel.findById(id)
      .populate('borrower', 'name village')
      .populate('installments')
      
    if (!loan) {
      return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: loan })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  await dbConnect()
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid loan ID' }, { status: 400 })
    }
    const body = await request.json()
    const validation = updateLoanSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 })
    }

    const loan = await LoanModel.findByIdAndUpdate(id, validation.data, { new: true, runValidators: true })
    if (!loan) {
      return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: loan })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  await dbConnect()
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid loan ID' }, { status: 400 })
    }
    const loan = await LoanModel.findById(id)
    if (!loan) {
      return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 })
    }
    
    // Also delete all associated installments
    await Installment.deleteMany({ _id: { $in: loan.installments } })
    await LoanModel.findByIdAndDelete(id)
    
    return NextResponse.json({ success: true, data: { message: 'Loan and installments deleted' } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}