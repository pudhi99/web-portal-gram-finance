'use client';

import { CollectorForm } from '@/components/collectors/CollectorForm';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

async function getCollectorById(id: string) {
  const res = await fetch(`/api/collectors/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch collector');
  }
  const data = await res.json();
  return data.data;
}

export default function EditCollectorPage({ params }: { params: Promise<{ id: string }> }) {
  const [collector, setCollector] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollector = async () => {
      try {
        const { id } = await params;
        if (!id) return;
        const data = await getCollectorById(id);
        setCollector(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchCollector();
  }, [params]);

  if (!collector) {
    return <div>Collector not found.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <CollectorForm initialData={collector} isEditing={true} />
    </div>
  );
} 