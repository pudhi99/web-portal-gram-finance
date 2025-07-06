import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import CollectionModel from '@/models/Collection';
import mongoose from 'mongoose';
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
    console.log('Payments API - Searching for loanId:', loanId);
    
    // First, let's get all collections to see what we have
    const allCollections = await CollectionModel.find({}).limit(5);
    console.log('Payments API - Sample collections:', allCollections);
    
    // Get installments for this loan
    const installments = await mongoose.model('Installment').find({ loanId: loanId });
    console.log('Payments API - Installments for loan:', installments.length);
    console.log('Payments API - Installment IDs:', installments.map(i => i._id.toString()));
    
    if (installments.length === 0) {
      console.log('Payments API - No installments found for loan');
      return NextResponse.json({
        success: true,
        data: [],
      });
    }
    
    const installmentIds = installments.map(i => i._id);
    
    // Now find collections for these installments
    const collections = await CollectionModel.find({
      installmentId: { $in: installmentIds }
    })
    .populate('collectorId', 'name')
    .populate('installmentId', 'loanId')
    .sort({ createdAt: -1 });

    console.log('Payments API - Found collections:', collections.length);
    console.log('Payments API - First collection sample:', collections[0]);

    // Convert collections to payment format
    const payments = collections.map(collection => ({
      id: collection._id,
      loanId: loanId, // Use the loanId from the URL
      amount: collection.amount,
      paymentDate: collection.paymentDate,
      collectorName: collection.collectorId?.name || 'Unknown',
      collectorId: collection.collectorId?._id || '',
      status: 'COMPLETED', // Collections are always completed when they exist
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