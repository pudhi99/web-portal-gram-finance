import dbConnect from '@/lib/dbConnect';
import Collection from '@/models/Collection';
import { notFound } from 'next/navigation';
import { EditCollectionForm } from '@/components/collections/EditCollectionForm';

async function getCollection(id: string) {
  await dbConnect();
  try {
    const collection = await Collection.findById(id)
      .populate('installmentId', 'amount dueDate status installmentNumber')
      .populate('collectorId', 'name email phone')
      .lean();
    
    if (!collection) {
      return null;
    }
    return JSON.parse(JSON.stringify(collection));
  } catch (error) {
    console.error('Failed to fetch collection:', error);
    return null;
  }
}

export default async function EditCollectionPage({
  params,
}: {
  params: { id: string };
}) {
  await dbConnect();
  const context = { params };
  const collection = await getCollection(context.params.id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <EditCollectionForm collection={collection} />
    </div>
  );
} 