import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Collection from '@/models/Collection';
import Installment from '@/models/Installment';
import { UserModel } from '@/models/User';
import { collectionQuerySchema, createCollectionSchema } from '@/lib/validations/collection';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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
    const session = await getServerSession(authOptions);
    if (!session) {
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