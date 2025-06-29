import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { IBorrower } from '@/models/Borrower'
import Image from 'next/image'
import { notFound } from 'next/navigation'

async function getBorrowerById(id: string): Promise<IBorrower | null> {
  // This fetch needs to be absolute for Server Components
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/borrowers/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    // Return null or handle specific errors if needed
    return null
  }
  const data = await res.json()
  return data.data
}

export default async function BorrowerDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const borrower = await getBorrowerById(params.id)

  if (!borrower) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{borrower.name}</CardTitle>
          <CardDescription>
            Village: {borrower.village} | Joined:{' '}
            {new Date(borrower.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Personal Information
            </h3>
            <p>
              <strong>Household Head:</strong> {borrower.householdHead || 'N/A'}
            </p>
            <p>
              <strong>Phone:</strong> {borrower.phone || 'N/A'}
            </p>
            <p>
              <strong>Address:</strong> {borrower.address}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span
                className={
                  borrower.isActive
                    ? 'text-green-600 font-semibold'
                    : 'text-red-600 font-semibold'
                }
              >
                {borrower.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
            {borrower.gpsLat && borrower.gpsLng && (
              <p>
                <strong>Location:</strong> {borrower.gpsLat}, {borrower.gpsLng}
              </p>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Documents</h3>
            <div>
              <p className="font-semibold mb-2">Borrower Photo:</p>
              {borrower.photoUrl ? (
                <Image
                  src={borrower.photoUrl}
                  alt="Borrower Photo"
                  width={250}
                  height={250}
                  className="rounded-md border"
                />
              ) : (
                <p>No photo uploaded.</p>
              )}
            </div>
            <div>
              <p className="font-semibold mb-2">ID Proof:</p>
              {borrower.idProofUrl ? (
                <Image
                  src={borrower.idProofUrl}
                  alt="ID Proof"
                  width={250}
                  height={250}
                  className="rounded-md border"
                />
              ) : (
                <p>No ID proof uploaded.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 