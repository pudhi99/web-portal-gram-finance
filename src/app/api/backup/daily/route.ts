import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import CollectionModel from '@/models/Collection';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { format, startOfDay, endOfDay } from 'date-fns';
import { googleSheetsService } from '@/lib/google-sheets';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyJwtFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    // Authentication
    const jwtUser = verifyJwtFromRequest(request);
    let isAuthenticated = false;
    let userId = null;
    
    if (jwtUser) {
      isAuthenticated = true;
      userId = (jwtUser as any).id;
    } else {
      const session = await getServerSession(authOptions);
      if (session && session.user) {
        isAuthenticated = true;
        userId = session.user.id;
      }
    }
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { date = format(new Date(), 'yyyy-MM-dd') } = body;

    // Get collections for the specified date
    const startDate = startOfDay(new Date(date));
    const endDate = endOfDay(new Date(date));

    const collections = await CollectionModel.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: 'installments',
          localField: 'installmentId',
          foreignField: '_id',
          as: 'installment',
        },
      },
      {
        $unwind: '$installment',
      },
      {
        $lookup: {
          from: 'loans',
          localField: 'installment.loanId',
          foreignField: '_id',
          as: 'loan',
        },
      },
      {
        $unwind: '$loan',
      },
      {
        $lookup: {
          from: 'borrowers',
          localField: 'loan.borrower',
          foreignField: '_id',
          as: 'borrower',
        },
      },
      {
        $unwind: '$borrower',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'collectorId',
          foreignField: '_id',
          as: 'collector',
        },
      },
      {
        $unwind: {
          path: '$collector',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    // Calculate summary
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);
    const totalPayments = collections.length;

    // Group by collector
    const collectorMap = new Map();
    collections.forEach(collection => {
      const collectorName = collection.collector?.name || 'Unknown';
      if (!collectorMap.has(collectorName)) {
        collectorMap.set(collectorName, { collections: 0, amount: 0 });
      }
      const collector = collectorMap.get(collectorName);
      collector.collections += 1;
      collector.amount += collection.amount;
    });

    const collectors = Array.from(collectorMap.entries()).map(([name, data]: [string, any]) => ({
      name,
      collections: data.collections,
      amount: data.amount,
    }));

    // Format payments for backup
    const payments = collections.map(collection => ({
      loanNumber: collection.loan.loanNumber,
      borrowerName: collection.borrower.name,
      amount: collection.amount,
      collectorName: collection.collector?.name || 'Unknown',
      time: format(new Date(collection.paymentDate), 'HH:mm'),
      notes: collection.notes,
    }));

    // Calculate total outstanding (this would need to be calculated from loans)
    const totalOutstanding = 0; // Placeholder - would need to calculate from active loans

    const dailySummary = {
      date,
      totalCollected,
      totalPayments,
      totalOutstanding,
      collectors,
      payments,
    };

    // Backup to Google Sheets (or development mode)
    const backupSuccess = await googleSheetsService.backupDailyCollections(dailySummary);
    const serviceStatus = googleSheetsService.getDevelopmentInfo();

    return NextResponse.json({
      success: true,
      data: dailySummary,
      backup: {
        success: backupSuccess,
        serviceConfigured: googleSheetsService.isServiceConfigured(),
        status: serviceStatus,
      },
      message: backupSuccess 
        ? 'Daily collection summary generated and backed up successfully'
        : 'Daily collection summary generated but backup failed',
    });

  } catch (error) {
    console.error('Error generating daily backup:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily backup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    // Authentication
    const jwtUser = verifyJwtFromRequest(request);
    let isAuthenticated = false;
    
    if (jwtUser) {
      isAuthenticated = true;
    } else {
      const session = await getServerSession(authOptions);
      if (session && session.user) {
        isAuthenticated = true;
      }
    }
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

    // Check backup status using Google Sheets service
    const backupStatus = await googleSheetsService.getBackupStatus(date);
    const serviceStatus = googleSheetsService.getDevelopmentInfo();

    return NextResponse.json({
      success: true,
      data: {
        ...backupStatus,
        date,
        serviceConfigured: googleSheetsService.isServiceConfigured(),
        status: serviceStatus,
      },
    });

  } catch (error) {
    console.error('Error checking backup status:', error);
    return NextResponse.json(
      { error: 'Failed to check backup status' },
      { status: 500 }
    );
  }
} 