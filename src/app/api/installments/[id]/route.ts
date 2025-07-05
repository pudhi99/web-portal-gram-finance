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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const installment = await Installment.findById(params.id)
      .populate('loanId', 'loanNumber principalAmount borrower');

    if (!installment) {
      return NextResponse.json({ success: false, error: 'Installment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: installment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 