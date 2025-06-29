"use client"
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '../ui/button'
import { ThemeSwitcher } from './ThemeSwitcher'
import { LanguageSwitcher } from './LanguageSwitcher'

export default function Navbar() {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const isAuth = !!session

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-card shadow-md">
      <div className="font-bold text-lg">
        <Link href="/dashboard">{t('common.dashboard')}</Link>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
        {isAuth ? (
          <Link href="/api/auth/signout">
            <Button variant="destructive">{t('common.logout', 'Sign Out')}</Button>
          </Link>
        ) : (
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline">{t('common.login')}</Button>
            </Link>
            <Link href="/register">
              <Button>{t('common.register')}</Button>
            </Link>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4 lg:space-x-6">
        <Link href="/" className="font-bold">
          GramFinance
        </Link>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {t('common.dashboard')}
          </Link>
          <Link href="/borrowers" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {t('common.borrowers')}
          </Link>
          <Link href="/loans" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {t('common.loans')}
          </Link>
          <Link href="/collections" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {t('common.collections')}
          </Link>
          <Link href="/collectors" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {t('collectors.title')}
          </Link>
        </nav>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        {/* Existing code */}
      </div>
    </nav>
  )
} 