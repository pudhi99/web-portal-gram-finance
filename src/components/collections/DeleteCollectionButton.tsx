'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteCollectionButtonProps {
  collectionId: string;
}

export function DeleteCollectionButton({ collectionId }: DeleteCollectionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/collections');
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete collection: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
} 