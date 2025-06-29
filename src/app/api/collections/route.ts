import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Collection from '@/models/Collection';
import Installment from '@/models/Installment';
import { UserModel } from '@/models/User';
import { collectionQuerySchema, createCollectionSchema } from '@/lib/validations/collection';
import jwt from 'jsonwebtoken';
// NOTE: Make sure to install 'jsonwebtoken' in your project dependencies
// import type { NextRequest } from 'next/server'; // Already imported above

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

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = collectionQuerySchema.parse(Object.fromEntries(searchParams));

    const filter: any = {};

    if (query.collectorId) {
      filter.collectorId = query.collectorId;
    }

    if (query.installmentId) {
      filter.installmentId = query.installmentId;
    }

    if (query.startDate || query.endDate) {
      filter.paymentDate = {};
      if (query.startDate) {
        filter.paymentDate.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.paymentDate.$lte = new Date(query.endDate);
      }
    }

    const skip = (query.page - 1) * query.limit;

    const [collections, total] = await Promise.all([
      Collection.find(filter)
        .populate('installmentId', 'amount dueDate status installmentNumber')
        .populate('collectorId', 'name email phone')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Collection.countDocuments(filter),
    ]);

    return NextResponse.json({
      collections,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    await dbConnect();

    const body = await request.json();
    const validatedData = createCollectionSchema.parse(body);

    // Verify installment exists
    const installment = await Installment.findById(validatedData.installmentId);
    if (!installment) {
      return NextResponse.json(
        { error: 'Installment not found' },
        { status: 404 }
      );
    }

    // Verify collector exists
    const collector = await UserModel.findById(validatedData.collectorId);
    if (!collector) {
      return NextResponse.json(
        { error: 'Collector not found' },
        { status: 404 }
      );
    }

    const collection = new Collection({
      ...validatedData,
      installmentId: validatedData.installmentId,
      collectorId: validatedData.collectorId,
    });

    await collection.save();

    // Update installment status if payment covers the full amount
    if (validatedData.amount >= installment.amount) {
      await Installment.findByIdAndUpdate(validatedData.installmentId, {
        status: 'PAID',
      });
    } else if (validatedData.amount > 0) {
      await Installment.findByIdAndUpdate(validatedData.installmentId, {
        status: 'PARTIAL',
      });
    }

    const populatedCollection = await Collection.findById(collection._id)
      .populate('installmentId', 'amount dueDate status installmentNumber')
      .populate('collectorId', 'name email phone')
      .lean();

    return NextResponse.json(populatedCollection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
} 