'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthGuard } from '@/lib/useAuthGuard'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function Home() {
  useAuthGuard(true)

  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.replace('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <p className="text-gray-500">Loading your space…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50">

      {/* Top Bar */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          Conversa
        </h1>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 transition"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-10 max-w-2xl mx-auto space-y-6">

        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome back 👋
          </h2>
          <p className="text-sm text-gray-500">
            You’re logged in as {user.email}
          </p>
        </div>

        {/* Empty State / Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Your language partners will appear here.
          </p>
          <p className="text-xs text-gray-400">
            We’ll help you start meaningful conversations soon.
          </p>
        </div>

      </main>
    </div>
  )
}
