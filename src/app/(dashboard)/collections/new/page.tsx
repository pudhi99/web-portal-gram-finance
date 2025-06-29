'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CollectionForm } from '@/components/collections/CollectionForm';
import { toast } from 'sonner';

export default function NewCollectionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t('collections.createdSuccess', 'Collection created successfully'));
        router.push('/collections');
      } else {
        const error = await response.json();
        toast.error(error.error || t('collections.createError', 'Failed to create collection'));
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error(t('collections.createError', 'Failed to create collection'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/collections');
  };

  return (
    <div className='container mx-auto'>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('collections.addNew', 'Add New Collection')}
        </h1>
        <p className="text-muted-foreground">
          {t('collections.addDescription', 'Create a new payment collection record')}
        </p>
      </div>

      <CollectionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
    </div>
  );
} 