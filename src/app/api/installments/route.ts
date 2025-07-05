import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Installment from '@/models/Installment';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyJwtFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  
  // Try JWT auth first
  const jwtUser = verifyJwtFromRequest(request);
  let isAuthenticated = false;
  
  if (jwtUser) {
    isAuthenticated = true;
  } else {
    // Fallback to session auth
    const session = await getServerSession(authOptions);
    if (session && session.user) {
      isAuthenticated = true;
    }
  }
  
  if (!isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const loanId = searchParams.get('loanId');
    const status = searchParams.get('status');
    const dueDateStart = searchParams.get('dueDateStart');
    const dueDateEnd = searchParams.get('dueDateEnd');

    let query: any = {};
    
    if (loanId) {
      query.loanId = loanId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (dueDateStart || dueDateEnd) {
      query.dueDate = {};
      if (dueDateStart) {
        query.dueDate.$gte = new Date(dueDateStart);
      }
      if (dueDateEnd) {
        query.dueDate.$lte = new Date(dueDateEnd);
      }
    }

    const installments = await Installment.find(query)
      .populate('loanId', 'loanNumber principalAmount borrower')
      .sort({ dueDate: 1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Installment.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: installments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 