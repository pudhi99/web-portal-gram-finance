import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import { UserModel } from '@/models/User';
import Collection from '@/models/Collection';
import mongoose from 'mongoose';

async function getCollectorById(id: string): Promise<any | null> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  try {
    const collector = await UserModel.findOne({ _id: id, role: 'COLLECTOR' })
      .select('-password')
      .lean();
    if (!collector) return null;

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
    delete performance._id;

    return { ...collector, performance };
  } catch (error) {
    console.error('Error fetching collector from DB:', error);
    return null;
  }
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right break-words">{value}</span>
  </div>
);

export default async function CollectorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  const collector = await getCollectorById(id);

  if (!collector) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/collectors">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Collector Details</h1>
        <div className="flex gap-2 ml-auto">
          <Link href={`/collectors/${collector._id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{collector.name}</CardTitle>
              <CardDescription>
                Field Officer / Collector
              </CardDescription>
            </div>
            <Badge variant={collector.isActive ? 'default' : 'destructive'} className="text-lg capitalize">
              {collector.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-12 gap-y-8 pt-6">
          <div className="space-y-8">
            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <User className="w-5 h-5 mr-3 text-primary" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <DetailItem label="Name" value={collector.name} />
                <DetailItem label="Email" value={collector.email} />
                {collector.phone && <DetailItem label="Phone" value={collector.phone} />}
                {collector.assignedArea && <DetailItem label="Assigned Area" value={collector.assignedArea} />}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Performance Stats */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-3 text-primary" />
                Performance
              </h3>
              <div className="space-y-3">
                <DetailItem label="Total Collections" value={collector.performance.totalCollections} />
                <DetailItem
                  label="Total Amount Collected"
                  value={new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }).format(collector.performance.totalAmountCollected || 0)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 