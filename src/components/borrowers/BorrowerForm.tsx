'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { borrowerSchema, BorrowerFormValues } from '@/lib/validations/borrower'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import ImageUpload from '@/components/ui/ImageUpload'
import { useTranslation } from 'react-i18next'

interface BorrowerFormProps {
  initialData?: BorrowerFormValues & { _id?: string }
  isEditing: boolean
}

export function BorrowerForm({ initialData, isEditing }: BorrowerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const form = useForm<BorrowerFormValues>({
    resolver: zodResolver(borrowerSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      village: initialData?.village || '',
      isActive: initialData?.isActive ?? true, // Explicitly handle default
      // ensure other optional fields are handled
      gpsLat: initialData?.gpsLat,
      gpsLng: initialData?.gpsLng,
      photoUrl: initialData?.photoUrl,
      idProofUrl: initialData?.idProofUrl,
      householdHead: initialData?.householdHead,
    },
  })

  const onSubmit = async (data: BorrowerFormValues) => {
    setLoading(true)
    const url = isEditing
      ? `/api/borrowers/${initialData?._id}`
      : '/api/borrowers'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, isActive: data.isActive ?? true }),
      })
      if (!response.ok) throw new Error('Failed to save borrower.')
      router.push('/borrowers')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? t('borrower.editBorrower', 'Edit Borrower') : t('borrower.addNew', 'Add New Borrower')}
        </CardTitle>
        <CardDescription>
          {t('borrower.formDescription', 'Enter borrower details below')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('borrower.photo', "Borrower's Photo")}</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        value={field.value ? [field.value] : []}
                        onChange={field.onChange}
                        onRemove={() => field.onChange('')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idProofUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('borrower.idProof', 'ID Proof Photo')}</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        value={field.value ? [field.value] : []}
                        onChange={field.onChange}
                        onRemove={() => field.onChange('')}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('borrower.fullName', 'Full Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('borrower.fullNamePlaceholder', 'Enter full name')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('borrower.phone', 'Phone Number')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('borrower.phonePlaceholder', 'Enter phone number')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('borrower.address', 'Address')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('borrower.addressPlaceholder', 'Enter address')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('borrower.village', 'Village')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('borrower.villagePlaceholder', 'Enter village name')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="householdHead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('borrower.householdHead', 'Household Head')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('borrower.householdHeadPlaceholder', 'Enter household head name')} />
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
                    <FormLabel>{t('borrower.latitude', 'Latitude')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('borrower.latitudePlaceholder', 'Enter latitude')} />
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
                    <FormLabel>{t('borrower.longitude', 'Longitude')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('borrower.longitudePlaceholder', 'Enter longitude')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('borrower.active', 'Active')}</FormLabel>
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
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
  )
} 