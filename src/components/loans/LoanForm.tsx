'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loanSchema, LoanFormValues } from '@/lib/validations/loan'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IBorrower } from '@/models/Borrower'

interface LoanFormProps {
  borrowers: (IBorrower & { _id: string })[]
}

export function LoanForm({ borrowers }: LoanFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      borrowerId: '',
      principalAmount: undefined,
      disbursedAmount: undefined,
      termWeeks: 10,
      startDate: undefined,
    },
  })

  const onSubmit = async (data: LoanFormValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create loan.')
      }
      router.push('/loans')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Loan</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="borrowerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Borrower</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a borrower" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {borrowers.map((borrower) => (
                        <SelectItem key={borrower._id} value={borrower._id}>
                          {borrower.name} ({borrower.village})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="principalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Principal Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 10000"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(
                            value === '' ? undefined : parseFloat(value)
                          )
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="disbursedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disbursed Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 8500"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(
                            value === '' ? undefined : parseFloat(value)
                          )
                        }}
                        value={field.value ?? ''}
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
                name="termWeeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term (in weeks)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 10"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(
                            value === '' ? undefined : parseInt(value, 10)
                          )
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disbursement Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        setDate={(date) => field.onChange(date?.toISOString())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {loading ? 'Creating...' : 'Create Loan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 