'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/borrowers/data-table'; // Reusing the data-table component
import { columns } from '@/components/collectors/columns';
import { IUser } from '@/models/User';

type Collector = Pick<IUser, '_id' | 'name' | 'email' | 'phone' | 'assignedArea' | 'isActive'>;

export default function CollectorsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollectors() {
      try {
        setLoading(true);
        const response = await fetch('/api/collectors');
        if (response.ok) {
          const data = await response.json();
          setCollectors(data.data || []);
        } else {
          console.error('Failed to fetch collectors');
        }
      } catch (error) {
        console.error('Error fetching collectors:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCollectors();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-20">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-lg">{t('common.loading', 'Loading...')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('collectors.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('collectors.description')}
          </p>
        </div>
        <Button onClick={() => router.push('/collectors/new')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('collectors.addNew')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('collectors.allCollectors')}</CardTitle>
          <CardDescription>
            {t('collectors.tableDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={collectors}
            filterColumnId="name"
          />
        </CardContent>
      </Card>
    </div>
  );
} 