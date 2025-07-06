import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { LoanModel } from '@/models/Loan';
import { BorrowerModel } from '@/models/Borrower';
import Collection from '@/models/Collection';
import Installment from '@/models/Installment';
import { UserModel } from '@/models/User';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Get current date ranges
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Get all loans for the user
    const loans = await LoanModel.find({ userId: user._id }).populate('borrowerId');
    
    // Calculate loan statistics
    const totalLoans = loans.length;
    const activeLoans = loans.filter((loan: any) => loan.status === 'ACTIVE').length;
    const completedLoans = loans.filter((loan: any) => loan.status === 'COMPLETED').length;
    const defaultedLoans = loans.filter((loan: any) => loan.status === 'DEFAULTED').length;
    
    const totalOutstanding = loans
      .filter((loan: any) => loan.status === 'ACTIVE')
      .reduce((sum: number, loan: any) => sum + (loan.outstandingAmount || 0), 0);
    
    const totalCollected = loans.reduce((sum: number, loan: any) => sum + (loan.totalPaid || 0), 0);

    // Get total borrowers
    const totalBorrowers = await BorrowerModel.countDocuments({ userId: user._id });

    // Get all installment IDs for the user's loans
    const loanIds = loans.map((loan: any) => loan._id);
    const installments = await Installment.find({ loanId: { $in: loanIds } });
    const installmentIds = installments.map((inst: any) => inst._id);

    // Get today's collections
    const todayCollections = await Collection.find({
      installmentId: { $in: installmentIds },
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).populate({
      path: 'installmentId',
      populate: {
        path: 'loanId',
        populate: 'borrowerId'
      }
    }).populate('collectorId');

    const todayAmount = todayCollections.reduce((sum: number, collection: any) => sum + collection.amount, 0);

    // Get this week's collections
    const weeklyCollections = await Collection.find({
      installmentId: { $in: installmentIds },
      createdAt: { $gte: weekStart, $lte: weekEnd }
    }).populate({
      path: 'installmentId',
      populate: {
        path: 'loanId',
        populate: 'borrowerId'
      }
    }).populate('collectorId');

    const weeklyAmount = weeklyCollections.reduce((sum: number, collection: any) => sum + collection.amount, 0);

    // Get this month's collections
    const monthlyCollections = await Collection.find({
      installmentId: { $in: installmentIds },
      createdAt: { $gte: monthStart, $lte: monthEnd }
    }).populate({
      path: 'installmentId',
      populate: {
        path: 'loanId',
        populate: 'borrowerId'
      }
    }).populate('collectorId');

    const monthlyAmount = monthlyCollections.reduce((sum: number, collection: any) => sum + collection.amount, 0);

    // Get recent payments (last 10)
    const recentPayments = await Collection.find({ installmentId: { $in: installmentIds } })
      .populate({
        path: 'installmentId',
        populate: {
          path: 'loanId',
          populate: 'borrowerId'
        }
      })
      .populate('collectorId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedRecentPayments = recentPayments.map((payment: any) => ({
      id: payment._id.toString(),
      loanNumber: payment.installmentId?.loanId?.loanNumber || 'N/A',
      borrowerName: payment.installmentId?.loanId?.borrowerId?.name || 'N/A',
      amount: payment.amount,
      collectorName: payment.collectorId?.name || 'N/A',
      time: payment.createdAt
    }));

    // Get top collectors
    const collectorStats = await Collection.aggregate([
      { $match: { installmentId: { $in: installmentIds } } },
      {
        $group: {
          _id: '$collectorId',
          collections: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { amount: -1 } },
      { $limit: 5 }
    ]);

    const topCollectors = await Promise.all(
      collectorStats.map(async (stat: any) => {
        const collector = await UserModel.findById(stat._id);
        return {
          name: collector?.name || 'Unknown',
          collections: stat.collections,
          amount: stat.amount
        };
      })
    );

    // Loan status distribution
    const loanStatusDistribution = {
      active: activeLoans,
      completed: completedLoans,
      defaulted: defaultedLoans
    };

    const dashboardStats = {
      totalLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      totalBorrowers,
      totalCollected,
      totalOutstanding,
      todayCollections: todayCollections.length,
      todayAmount,
      weeklyCollections: weeklyCollections.length,
      weeklyAmount,
      monthlyCollections: monthlyCollections.length,
      monthlyAmount,
      recentPayments: formattedRecentPayments,
      topCollectors,
      loanStatusDistribution
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 