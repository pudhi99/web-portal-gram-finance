'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so we can safely set the mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  const changeLanguage = (lng: 'en' | 'te') => {
    i18n.changeLanguage(lng)
  }

  // Before the component has mounted on the client, we can't know the language
  // so we render a placeholder or null to avoid the error.
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">Language</p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>EN</Button>
          <Button variant="outline" size="sm" disabled>TE</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm text-muted-foreground">Language</p>
      <div className="flex gap-1">
        <Button
          variant={i18n.language?.startsWith('en') ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeLanguage('en')}
        >
          EN
        </Button>
        <Button
          variant={i18n.language?.startsWith('te') ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeLanguage('te')}
        >
          TE
        </Button>
      </div>
    </div>
  )
} 