import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Installment from '@/models/Installment';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const loanId = searchParams.get('loanId');

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (loanId) {
      filter.loanId = loanId;
    }

    const installments = await Installment.find(filter)
      .populate({
        path: 'loanId',
        populate: {
          path: 'borrower',
          select: 'name phone'
        }
      })
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json({ installments });
  } catch (error) {
    console.error('Error fetching installments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installments' },
      { status: 500 }
    );
  }
} 