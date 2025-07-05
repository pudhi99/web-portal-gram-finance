import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import dbConnect from '@/lib/dbConnect'
import { BorrowerModel } from '@/models/Borrower'
import { borrowerSchema } from '@/lib/validations/borrower'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function verifyJwtFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.split(' ')[1]
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  await dbConnect()
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const collectionDay = searchParams.get('collectionDay')

    let query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }
    if (collectionDay) {
      query.collectionDays = collectionDay
    }

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
  
  // Try JWT auth first
  const jwtUser = verifyJwtFromRequest(request)
  let isAuthenticated = false
  
  if (jwtUser) {
    isAuthenticated = true
  } else {
    // Fallback to session auth
    const session = await getServerSession(authOptions)
    if (session && session.user) {
      isAuthenticated = true
    }
  }
  
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }
  
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