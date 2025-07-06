import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import CollectionModel from '@/models/Collection';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const loanId = params.id;
    if (!loanId) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }

    // Get all collections for this loan
    const collections = await CollectionModel.find({ loan: loanId })
      .populate('collector', 'name')
      .populate('loan', 'loanNumber borrower')
      .populate('borrower', 'name')
      .sort({ createdAt: -1 });

    // Convert collections to payment format
    const payments = collections.map(collection => ({
      id: collection._id,
      loanId: collection.loan._id,
      amount: collection.amount,
      paymentDate: collection.collectionDate,
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