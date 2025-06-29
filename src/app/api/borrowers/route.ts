import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { BorrowerModel } from '@/models/Borrower'
import { borrowerSchema } from '@/lib/validations/borrower'

export async function GET(request: NextRequest) {
  await dbConnect()
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { village: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const borrowers = await BorrowerModel.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await BorrowerModel.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: borrowers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await dbConnect()
  try {
    const body = await request.json()
    const validation = borrowerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 })
    }

    const borrower = await BorrowerModel.create(validation.data)
    return NextResponse.json({ success: true, data: borrower }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
} 