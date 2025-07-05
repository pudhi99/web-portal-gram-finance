import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import dbConnect from '@/lib/dbConnect'
import { LoanModel } from '@/models/Loan'
import { BorrowerModel } from '@/models/Borrower'
import { LoanStatus } from '@/types/loan'
import '@/lib/models'
import { handleCors, corsHeaders } from '@/lib/cors'
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
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

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
    const response = NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    Object.entries(corsHeaders(request)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  try {
    await dbConnect()

    const totalBorrowers = await BorrowerModel.countDocuments()

    const loanStats = await LoanModel.aggregate([
      {
        $group: {
          _id: null,
          totalPrincipal: { $sum: '$principalAmount' },
          totalLoans: { $sum: 1 },
          activeLoans: {
            $sum: {
              $cond: [{ $eq: ['$status', LoanStatus.ACTIVE] }, 1, 0],
            },
          },
        },
      },
    ])

    const installmentStats = await LoanModel.aggregate([
      {
        $unwind: '$installments',
      },
      {
        $group: {
          _id: null,
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ['$installments.status', 'Paid'] }, '$installments.amount', 0],
            },
          },
        },
      },
    ])

    const stats = {
      totalBorrowers: totalBorrowers || 0,
      totalPrincipal: loanStats[0]?.totalPrincipal || 0,
      totalLoans: loanStats[0]?.totalLoans || 0,
      activeLoans: loanStats[0]?.activeLoans || 0,
      totalPaid: installmentStats[0]?.totalPaid || 0,
      outstandingAmount: (loanStats[0]?.totalPrincipal || 0) - (installmentStats[0]?.totalPaid || 0)
    }

    const response = NextResponse.json({ success: true, data: stats })
    Object.entries(corsHeaders(request)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    const response = NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
    Object.entries(corsHeaders(request)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
} 