import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { BorrowerModel } from '@/models/Borrower'
import { borrowerSchema } from '@/lib/validations/borrower'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  await dbConnect()
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid borrower ID' }, { status: 400 })
    }
    const borrower = await BorrowerModel.findById(id)
    if (!borrower) {
      return NextResponse.json({ success: false, error: 'Borrower not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: borrower })
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
      return NextResponse.json({ success: false, error: 'Invalid borrower ID' }, { status: 400 })
    }
    const body = await request.json()
    const validation = borrowerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 })
    }
    const borrower = await BorrowerModel.findByIdAndUpdate(id, validation.data, { new: true, runValidators: true })
    if (!borrower) {
      return NextResponse.json({ success: false, error: 'Borrower not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: borrower })
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
      return NextResponse.json({ success: false, error: 'Invalid borrower ID' }, { status: 400 })
    }
    const deletedBorrower = await BorrowerModel.findByIdAndDelete(id)
    if (!deletedBorrower) {
      return NextResponse.json({ success: false, error: 'Borrower not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { message: 'Borrower deleted successfully' } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}