'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createCollectionSchema } from '@/lib/validations/collection';

interface Borrower {
  _id: string;
  name: string;
  phone?: string;
}

interface Installment {
  _id: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  status: string;
  installmentNumber: number;
  loanId?: {
    _id: string;
    borrower?: {
      _id: string;
      name: string;
    };
  };
}

interface Collector {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface CollectionFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CollectionForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: CollectionFormProps) {
  const { t } = useTranslation();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [filteredInstallments, setFilteredInstallments] = useState<Installment[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>('');

  const form = useForm<any>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      amount: initialData?.amount || '',
      paymentDate: initialData?.paymentDate ? new Date(initialData.paymentDate) : new Date(),
      gpsLat: initialData?.gpsLat || undefined,
      gpsLng: initialData?.gpsLng || undefined,
      notes: initialData?.notes || '',
      installmentId: initialData?.installmentId || '',
      collectorId: initialData?.collectorId || '',
      borrowerId: '', // This is only for filtering, not submitted
    },
  });

  useEffect(() => {
    fetchBorrowers();
    fetchInstallments();
    fetchCollectors();
  }, []);

  useEffect(() => {
    if (selectedBorrowerId && installments.length > 0) {
      const filtered = installments.filter(
        (installment) => installment.loanId?.borrower?._id === selectedBorrowerId
      );
      setFilteredInstallments(filtered);
    } else {
      setFilteredInstallments([]);
    }
  }, [selectedBorrowerId, installments]);

  const fetchBorrowers = async () => {
    try {
      const response = await fetch('/api/borrowers');
      if (response.ok) {
        const data = await response.json();
        setBorrowers(data.data || []); // API returns { success: true, data: borrowers }
      }
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    }
  };

  const fetchInstallments = async () => {
    try {
      const response = await fetch('/api/installments');
      if (response.ok) {
        const data = await response.json();
        setInstallments(data.installments || []);
      }
    } catch (error) {
      console.error('Error fetching installments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCollectors = async () => {
    try {
      const response = await fetch('/api/users?role=COLLECTOR');
      if (response.ok) {
        const data = await response.json();
        setCollectors(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching collectors:', error);
    }
  };

  const handleBorrowerChange = (borrowerId: string) => {
    setSelectedBorrowerId(borrowerId);
    // Reset installment selection when borrower changes
    form.setValue('installmentId', '');
    form.setValue('amount', '');
  };

  const handleInstallmentChange = (installmentId: string) => {
    const selectedInstallment = filteredInstallments.find(i => i._id === installmentId);
    
    if (selectedInstallment && typeof selectedInstallment.amountDue === 'number') {
      // Set amount to the remaining amount (amountDue - amountPaid)
      const remainingAmount = selectedInstallment.amountDue - (selectedInstallment.amountPaid || 0);
      form.setValue('amount', remainingAmount.toString());
    } else {
      form.setValue('amount', '');
    }
  };

  const handleSubmit = (data: any) => {
    // Convert amount to number - handle both string and number inputs
    if (data.amount !== undefined && data.amount !== '') {
      data.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    } else {
      data.amount = 0; // Set default if empty
    }
    
    // Remove borrowerId from submission data as it's only for filtering
    const { borrowerId, ...submissionData } = data;
    
    onSubmit(submissionData);
  };

  const getInstallmentDisplayText = (installment: Installment) => {
    const remainingAmount = installment.amountDue - (installment.amountPaid || 0);
    const dueDate = installment.dueDate ? new Date(installment.dueDate).toLocaleDateString() : 'Unknown';
    return `#${installment.installmentNumber} - Due: ${dueDate} - Remaining: ₹${remainingAmount}`;
  };

  if (loadingData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-lg">{t('common.loading', 'Loading...')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? t('collections.editCollection', 'Edit Collection') : t('collections.addNew', 'Add New Collection')}
        </CardTitle>
        <CardDescription>
          {t('collections.formDescription', 'Enter collection details below')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="borrowerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('collections.form.borrower', 'Borrower')}</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleBorrowerChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('collections.selectBorrower', 'Select borrower')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {borrowers.length > 0 ? (
                          borrowers.map((borrower) => (
                            <SelectItem key={borrower._id} value={borrower._id}>
                              {borrower.name} {borrower.phone && `(${borrower.phone})`}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No borrowers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collectorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('collections.form.collector', 'Collector')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('collections.selectCollector', 'Select collector')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {collectors.map((collector) => (
                          <SelectItem key={collector._id} value={collector._id}>
                            {collector.name} ({collector.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('collections.form.installment', 'Installment')}</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleInstallmentChange(value);
                      }} 
                      defaultValue={field.value}
                      disabled={!selectedBorrowerId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !selectedBorrowerId 
                              ? t('collections.selectBorrowerFirst', 'Select borrower first') 
                              : t('collections.selectInstallment', 'Select installment')
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredInstallments.map((installment) => (
                          <SelectItem key={installment._id} value={installment._id}>
                            {getInstallmentDisplayText(installment)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('collections.form.amount', 'Amount')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('collections.form.paymentDate', 'Payment Date')}</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gpsLat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('collections.form.gpsLocation', 'GPS Location')} - Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="12.9716"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('collections.gpsDescription', 'Optional GPS coordinates for location tracking')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gpsLng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="77.5946"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                  <FormLabel>{t('collections.form.notes', 'Notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('collections.notesPlaceholder', 'Add any additional notes about this collection...')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('common.loading', 'Loading...') : t('common.save', 'Save')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 