'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof schema>

export default function LoginForm() {
  const { t } = useTranslation()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', {
      username: values.username,
      password: values.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError(t('auth.invalidCredentials', 'Invalid username or password'))
    } else if (res?.ok) {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('auth.loginTitle')}</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.username')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('auth.usernamePlaceholder', 'Enter your username')} autoFocus />
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
                    <Input {...field} type="password" placeholder={t('auth.passwordPlaceholder', 'Enter your password')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.loginButton')}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  )
} 