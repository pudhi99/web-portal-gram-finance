'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import { columns } from '@/components/collections/columns';
import { DataTable } from '@/components/collections/data-table';
import { CollectionListItem } from '@/types/collection';

export default function CollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    fetchCollections();
  }, [session, status, router]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/collections');
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      setCollections(data.collections || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={fetchCollections} className="mt-4">
                {t('common.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('collections.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('collections.description')}
          </p>
        </div>
        <Button onClick={() => router.push('/collections/new')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('collections.addNew')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('collections.listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={collections} />
        </CardContent>
      </Card>
    </div>
  );
} 