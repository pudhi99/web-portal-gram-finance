'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function SignOutButton() {
  return (
    <Button variant="outline" className="mt-2" onClick={() => signOut({ callbackUrl: '/login' })}>
      Sign Out
    </Button>
  )
} 