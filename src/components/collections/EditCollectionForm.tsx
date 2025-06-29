'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateCollectionSchema,
  UpdateCollectionInput,
} from '@/lib/validations/collection';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { ICollection } from '@/models/Collection';

interface EditCollectionFormProps {
  collection: ICollection & { 
    _id: string;
    installmentId: {
      _id: string;
      installmentNumber: number;
      dueDate: Date;
      status: string;
      amount: number;
    };
    collectorId: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
}

export function EditCollectionForm({ collection }: EditCollectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<UpdateCollectionInput>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      amount: collection.amount ?? undefined,
      paymentDate: collection.paymentDate ? new Date(collection.paymentDate) : undefined,
      gpsLat: collection.gpsLat ?? undefined,
      gpsLng: collection.gpsLng ?? undefined,
      notes: collection.notes || '',
    },
  });

  const onSubmit = async (data: UpdateCollectionInput) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${collection._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update collection.');
      }
      
      router.push(`/collections/${collection._id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gpsLat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPS Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., 17.3850"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gpsLng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPS Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., 78.4867"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this collection..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Collection Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Installment:</span>
                  <div className="font-medium">#{collection.installmentId.installmentNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <div className="font-medium">
                    {format(new Date(collection.installmentId.dueDate), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Collector:</span>
                  <div className="font-medium">{collection.collectorId.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="font-medium">{collection.installmentId.status}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 