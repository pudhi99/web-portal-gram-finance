'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCollectorSchema, updateCollectorSchema, CreateCollectorInput, UpdateCollectorInput } from '@/lib/validations/collector';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface CollectorFormProps {
  initialData?: any;
  isEditing: boolean;
}

export function CollectorForm({ initialData, isEditing }: CollectorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateCollectorInput | UpdateCollectorInput>({
    resolver: zodResolver(isEditing ? updateCollectorSchema : createCollectorSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      username: initialData?.username || '',
      password: '', // Only used for create
      phone: initialData?.phone || '',
      assignedArea: initialData?.assignedArea || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    const url = isEditing
      ? `/api/collectors/${initialData?._id}`
      : '/api/collectors';
    const method = isEditing ? 'PUT' : 'POST';
    // Don't send password on edit
    if (isEditing) delete data.password;
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save collector.');
      router.push('/collectors');
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
        <CardTitle>{isEditing ? 'Edit Collector' : 'Add New Collector'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Area</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter assigned area or group" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Collector'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 