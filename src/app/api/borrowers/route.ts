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

    // Use aggregation to get borrowers with loan statistics
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'loans',
          localField: '_id',
          foreignField: 'borrower',
          as: 'loans'
        }
      },
      {
        $lookup: {
          from: 'collections',
          localField: 'loans._id',
          foreignField: 'installmentId',
          as: 'collections'
        }
      },
      {
        $addFields: {
          loansCount: { $size: '$loans' },
          totalOutstanding: {
            $sum: {
              $map: {
                input: '$loans',
                as: 'loan',
                in: {
                  $subtract: [
                    '$$loan.principalAmount',
                    {
                      $ifNull: [
                        {
                          $sum: {
                            $map: {
                              input: {
                                $filter: {
                                  input: '$collections',
                                  as: 'collection',
                                  cond: { $eq: ['$$collection.installmentId', '$$loan._id'] }
                                }
                              },
                              as: 'collection',
                              in: '$$collection.amount'
                            }
                          }
                        },
                        0
                      ]
                    }
                  ]
                }
              }
            }
          },
          lastCollection: {
            $max: {
              $map: {
                input: '$collections',
                as: 'collection',
                in: '$$collection.paymentDate'
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          phone: 1,
          address: 1,
          village: 1,
          gpsLat: 1,
          gpsLng: 1,
          photoUrl: 1,
          idProofUrl: 1,
          householdHead: 1,
          isActive: 1,
          collectionDays: 1,
          createdAt: 1,
          updatedAt: 1,
          loansCount: 1,
          totalOutstanding: 1,
          lastCollection: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]

    const borrowers = await BorrowerModel.aggregate(pipeline)
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