import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { UserModel } from '@/models/User';
import Collection from '@/models/Collection';
import { updateCollectorSchema } from '@/lib/validations/collector';

// Get a single collector's details and performance stats
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid collector ID' }, { status: 400 });
    }

    const collector = await UserModel.findOne({ _id: id, role: 'COLLECTOR' }).lean();

    if (!collector) {
      return NextResponse.json({ success: false, error: 'Collector not found' }, { status: 404 });
    }

    // Fetch performance stats
    const stats = await Collection.aggregate([
      { $match: { collectorId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalCollections: { $sum: 1 },
          totalAmountCollected: { $sum: '$amount' },
        },
      },
    ]);

    const performance = stats[0] || { totalCollections: 0, totalAmountCollected: 0 };
    delete performance._id; // Clean up the response

    // Exclude password from the response
    const { password, ...collectorData } = collector;

    return NextResponse.json({ success: true, data: { ...collectorData, performance } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch collector details' }, { status: 500 });
  }
}

// Update a collector's details
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid collector ID' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateCollectorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 });
    }

    const updatedCollector = await UserModel.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedCollector) {
      return NextResponse.json({ success: false, error: 'Collector not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCollector });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update collector' }, { status: 500 });
  }
}

// Soft-delete (deactivate) a collector
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid collector ID' }, { status: 400 });
    }

    const deactivatedCollector = await UserModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deactivatedCollector) {
      return NextResponse.json({ success: false, error: 'Collector not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Collector has been deactivated.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to deactivate collector' }, { status: 500 });
  }
} 