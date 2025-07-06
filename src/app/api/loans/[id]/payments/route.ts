import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import CollectionModel from '@/models/Collection';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyJwtFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  console.log('Payments API - Auth header:', authHeader);
  
  if (!authHeader) {
    console.log('Payments API - No auth header found');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Payments API - Token extracted:', token ? 'Present' : 'Missing');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Payments API - JWT verification successful:', decoded);
    return decoded;
  } catch (error) {
    console.log('Payments API - JWT verification failed:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  
  try {
    // Try JWT auth first
    const jwtUser = verifyJwtFromRequest(request);
    let isAuthenticated = false;
    let userId = null;
    
    console.log('Payments API - JWT user:', jwtUser);
    
    if (jwtUser) {
      isAuthenticated = true;
      userId = (jwtUser as any).id;
      console.log('Payments API - Authenticated via JWT, user ID:', userId);
    } else {
      // Fallback to session auth
      const session = await getServerSession(authOptions);
      console.log('Payments API - Session:', session);
      
      if (session && session.user) {
        isAuthenticated = true;
        userId = session.user.id;
        console.log('Payments API - Authenticated via session, user ID:', userId);
      }
    }
    
    if (!isAuthenticated) {
      console.log('Payments API - Not authenticated, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: loanId } = await params;
    if (!loanId) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }

    // Get all collections for this loan by finding installments first
    const collections = await CollectionModel.aggregate([
      {
        $lookup: {
          from: 'installments',
          localField: 'installmentId',
          foreignField: '_id',
          as: 'installment'
        }
      },
      {
        $unwind: '$installment'
      },
      {
        $match: {
          'installment.loanId': loanId
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'collectorId',
          foreignField: '_id',
          as: 'collector'
        }
      },
      {
        $unwind: {
          path: '$collector',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'loans',
          localField: 'installment.loanId',
          foreignField: '_id',
          as: 'loan'
        }
      },
      {
        $unwind: '$loan'
      },
      {
        $lookup: {
          from: 'borrowers',
          localField: 'loan.borrower',
          foreignField: '_id',
          as: 'borrower'
        }
      },
      {
        $unwind: '$borrower'
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Convert collections to payment format
    const payments = collections.map(collection => ({
      id: collection._id,
      loanId: collection.loan._id,
      amount: collection.amount,
      paymentDate: collection.paymentDate,
      collectorName: collection.collector?.name || 'Unknown',
      collectorId: collection.collector?._id || '',
      status: collection.status === 'COLLECTED' ? 'COMPLETED' : 'PENDING',
      notes: collection.notes,
      createdAt: collection.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
} 