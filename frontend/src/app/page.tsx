'use client'

import { useState } from 'react'
import { GuestDashboard } from '@/components/dashboard/GuestDashboard'
import { AuthScreen } from '@/components/auth/AuthScreen'

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false)

  if (showAuth) {
    return <AuthScreen onBackToGuest={() => setShowAuth(false)} />
  }

  return <GuestDashboard onShowAuth={() => setShowAuth(true)} />
}