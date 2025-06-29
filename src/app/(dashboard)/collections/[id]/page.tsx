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
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  User,
  Hash,
  Briefcase,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { DeleteCollectionButton } from '@/components/collections/DeleteCollectionButton';
import dbConnect from '@/lib/dbConnect';
import Collection from '@/models/Collection';
import mongoose from 'mongoose';

async function getCollectionById(id: string): Promise<any | null> {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  try {
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
            select: 'name village',
          },
        },
      })
      .lean();

    return JSON.parse(JSON.stringify(collection));
  } catch (error) {
    console.error('Error fetching collection from DB:', error);
    return null;
  }
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-right break-words">{value}</span>
  </div>
);

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'default';
    case 'PARTIAL':
      return 'secondary';
    case 'OVERDUE':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default async function CollectionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  const collection = await getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/collections">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Collection Details
        </h1>
        <div className="flex gap-2 ml-auto">
          <Link href={`/collections/${collection._id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <DeleteCollectionButton collectionId={collection._id} />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">
                #{collection._id.slice(-6).toUpperCase()}
              </CardTitle>
              <CardDescription>
                For {collection.installmentId.loanId.borrower.name} from{' '}
                {collection.installmentId.loanId.borrower.village}
              </CardDescription>
            </div>
            <Badge
              variant={getStatusVariant(collection.installmentId.status)}
              className="text-lg capitalize"
            >
              {collection.installmentId.status.toLowerCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-12 gap-y-8 pt-6">
          <div className="space-y-8">
            {/* Payment Details */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-3 text-primary" />
                Payment Details
              </h3>
              <div className="space-y-3">
                <DetailItem
                  label="Amount Paid"
                  value={new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }).format(collection.amount || 0)}
                />
                <DetailItem
                  label="Payment Date"
                  value={format(new Date(collection.paymentDate), 'PPP')}
                />
                {collection.notes && (
                  <DetailItem label="Notes" value={collection.notes} />
                )}
              </div>
            </div>

            {/* Collector Information */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <User className="w-5 h-5 mr-3 text-primary" />
                Collector Information
              </h3>
              <div className="space-y-3">
                <DetailItem label="Name" value={collection.collectorId.name} />
                <DetailItem
                  label="Email"
                  value={collection.collectorId.email}
                />
                {collection.collectorId.phone && (
                  <DetailItem
                    label="Phone"
                    value={collection.collectorId.phone}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Installment Details */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <Hash className="w-5 h-5 mr-3 text-primary" />
                Installment Details
              </h3>
              <div className="space-y-3">
                <DetailItem
                  label="Installment #"
                  value={`#${collection.installmentId.installmentNumber}`}
                />
                <DetailItem
                  label="Amount Due"
                  value={new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }).format(collection.installmentId.amount || 0)}
                />
                <DetailItem
                  label="Due Date"
                  value={format(
                    new Date(collection.installmentId.dueDate),
                    'PPP'
                  )}
                />
              </div>
            </div>

            {/* Loan Information */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-3 text-primary" />
                Loan Information
              </h3>
              <div className="space-y-3">
                <DetailItem
                  label="Loan Number"
                  value={collection.installmentId.loanId.loanNumber}
                />
                <DetailItem
                  label="Borrower"
                  value={collection.installmentId.loanId.borrower.name}
                />
                <DetailItem
                  label="Village"
                  value={collection.installmentId.loanId.borrower.village}
                />
              </div>
            </div>

            {/* Location */}
            {collection.gpsLat && collection.gpsLng && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-primary" />
                  Location
                </h3>
                <div className="space-y-3">
                  <DetailItem
                    label="Coordinates"
                    value={`${collection.gpsLat}, ${collection.gpsLng}`}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 