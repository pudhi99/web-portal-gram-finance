import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Collection from '@/models/Collection';
import mongoose from 'mongoose';
import { updateCollectionSchema } from '@/lib/validations/collection';
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Try JWT auth first
    const jwtUser = verifyJwtFromRequest(request);
    let isAuthenticated = false;
    if (jwtUser) {
      isAuthenticated = true;
    } else {
      // Fallback to session auth
      const session = await getServerSession(authOptions);
      if (session) isAuthenticated = true;
    }
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid collection ID' }, { status: 400 });
    }

    const collection = await Collection.findById(id)
      .populate('installmentId', 'amount dueDate status installmentNumber loanId')
      .populate('collectorId', 'name email phone')
      .populate({
        path: 'installmentId',
        populate: {
          path: 'loanId',
          select: 'loanNumber borrower',
          populate: {
            path: 'borrower',
            select: 'name village'
          }
        }
      })
      .lean();

    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: collection });
  } catch (error: any) {
    console.error('Error fetching collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Try JWT auth first
    const jwtUser = verifyJwtFromRequest(request);
    let isAuthenticated = false;
    if (jwtUser) {
      isAuthenticated = true;
    } else {
      // Fallback to session auth
      const session = await getServerSession(authOptions);
      if (session) isAuthenticated = true;
    }
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid collection ID' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateCollectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 });
    }

    const collection = await Collection.findByIdAndUpdate(
      id, 
      validation.data, 
      { new: true, runValidators: true }
    )
    .populate('installmentId', 'amount dueDate status installmentNumber')
    .populate('collectorId', 'name email phone')
    .lean();

    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: collection });
  } catch (error: any) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Try JWT auth first
    const jwtUser = verifyJwtFromRequest(request);
    let isAuthenticated = false;
    if (jwtUser) {
      isAuthenticated = true;
    } else {
      // Fallback to session auth
      const session = await getServerSession(authOptions);
      if (session) isAuthenticated = true;
    }
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid collection ID' }, { status: 400 });
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }

    await Collection.findByIdAndDelete(id);

    return NextResponse.json({ success: true, data: { message: 'Collection deleted successfully' } });
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 