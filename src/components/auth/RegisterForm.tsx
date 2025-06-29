'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterFormValues = z.infer<typeof schema>

export default function RegisterForm() {
  const { t } = useTranslation()
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', username: '', email: '', password: '' },
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.success) {
      setError(data.error || t('auth.registrationFailed', 'Registration failed'))
    } else {
      setSuccess(t('auth.registrationSuccess', 'Registration successful! You can now log in.'))
      form.reset()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('auth.registerTitle')}</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('borrower.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('auth.namePlaceholder', 'Enter your name')} />
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
                  <FormLabel>{t('auth.username')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('auth.usernamePlaceholder', 'Choose a username')} />
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
                  <FormLabel>{t('user.email', 'Email')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('auth.emailPlaceholder', 'Enter your email')} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.password')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder={t('auth.passwordPlaceholder', 'Create a password')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.registerButton')}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  )
} 