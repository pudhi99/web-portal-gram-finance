import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { LoanModel } from '@/models/Loan'
import Installment, { IInstallment } from '@/models/Installment'
import { loanSchema } from '@/lib/validations/loan'
import { addWeeks, parseISO } from 'date-fns'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function verifyJwtFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  console.log('Loans API - Auth header:', authHeader);
  
  if (!authHeader) {
    console.log('Loans API - No auth header found');
    return null;
  }
  
  const token = authHeader.split(' ')[1]
  console.log('Loans API - Token extracted:', token ? 'Present' : 'Missing');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Loans API - JWT verification successful:', decoded);
    return decoded;
  } catch (error) {
    console.log('Loans API - JWT verification failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  await dbConnect()
  try {
    const loans = await LoanModel.aggregate([
      {
        $lookup: {
          from: 'installments',
          localField: 'installments',
          foreignField: '_id',
          as: 'installmentsData',
        },
      },
      {
        $lookup: {
          from: 'borrowers',
          localField: 'borrower',
          foreignField: '_id',
          as: 'borrowerData',
        },
      },
      {
        $unwind: '$borrowerData',
      },
      {
        $addFields: {
          totalPaid: { $sum: '$installmentsData.amountPaid' },
          borrowerName: '$borrowerData.name',
        },
      },
      {
        $addFields: {
          outstandingAmount: { $subtract: ['$principalAmount', '$totalPaid'] },
        },
      },
      {
        $project: {
          loanNumber: 1,
          principalAmount: 1,
          disbursedAmount: 1,
          outstandingAmount: 1,
          status: 1,
          borrower: {
            _id: '$borrowerData._id',
            name: '$borrowerData.name',
          },
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])

    return NextResponse.json({ success: true, data: loans })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  await dbConnect()
  
  // Try JWT auth first
  const jwtUser = verifyJwtFromRequest(request)
  let isAuthenticated = false
  let userId = null
  
  console.log('Loans API - JWT user:', jwtUser);
  
  if (jwtUser) {
    isAuthenticated = true
    userId = (jwtUser as any).id
    console.log('Loans API - Authenticated via JWT, user ID:', userId);
  } else {
    // Fallback to session auth
    const session = await getServerSession(authOptions)
    console.log('Loans API - Session:', session);
    
    if (session && session.user) {
      isAuthenticated = true
      userId = session.user.id
      console.log('Loans API - Authenticated via session, user ID:', userId);
    }
  }
  
  if (!isAuthenticated) {
    console.log('Loans API - Not authenticated, returning 401');
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validation = loanSchema.safeParse(body)
    if (!validation.success) {
      // Convert validation errors to a readable string
      const errorMessages = Object.entries(validation.error.format()).map(([field, errors]) => {
        if (errors && typeof errors === 'object' && '_errors' in errors) {
          return `${field}: ${(errors as any)._errors.join(', ')}`;
        }
        return `${field}: Invalid value`;
      }).join('; ');
      
      return NextResponse.json({ success: false, error: errorMessages }, { status: 400 })
    }

    const { principalAmount, termWeeks, startDate, borrowerId, disbursedAmount } = validation.data
    
    // 1. Create the loan first to get a loanId
    const loanNumber = `LOAN-${Date.now()}` // Simple unique loan number
    const newLoan = new LoanModel({
      loanNumber,
      principalAmount,
      disbursedAmount,
      termWeeks,
      startDate: parseISO(startDate),
      borrower: borrowerId,
      createdBy: userId,
      installments: [], // Start with an empty array
    })
    const savedLoan = await newLoan.save()
    
    // 2. Generate installments with the new loan's ID
    const weeklyInstallment = principalAmount / termWeeks
    const installmentDocs = []

    for (let i = 0; i < termWeeks; i++) {
      const dueDate = addWeeks(parseISO(startDate), i + 1)
      installmentDocs.push({
        loanId: savedLoan._id,
        installmentNumber: i + 1,
        dueDate,
        amount: weeklyInstallment,
      })
    }
    const createdInstallments = await Installment.insertMany(installmentDocs)
    const installmentIds = createdInstallments.map((inst: IInstallment) => inst._id)

    // 3. Update the loan with the new installment IDs
    savedLoan.installments = installmentIds
    await savedLoan.save()

    return NextResponse.json({ success: true, data: savedLoan }, { status: 201 })
  } catch (error: any) {
    console.error('Loan creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
} 