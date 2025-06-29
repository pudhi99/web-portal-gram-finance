import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { UserModel } from '@/models/User';
import { createCollectorSchema } from '@/lib/validations/collector';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const collectors = await UserModel.find({ role: 'COLLECTOR' }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: collectors });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch collectors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    const validation = createCollectorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 });
    }

    const { name, email, username, password, phone, assignedArea, isActive } = validation.data;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'A user with this email or username already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCollector = await UserModel.create({
      name,
      email,
      username,
      password: hashedPassword,
      phone,
      assignedArea,
      isActive,
      role: 'COLLECTOR',
    });

    return NextResponse.json({ success: true, data: newCollector }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create collector' }, { status: 500 });
  }
} 