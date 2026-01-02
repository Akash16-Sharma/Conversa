'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthGuard } from '@/lib/useAuthGuard'

export default function HomePage() {
  useAuthGuard(true)

  const router = useRouter()
  const [name, setName] = useState<string>('')

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.user.id)
        .single()

      setName(profile?.full_name || 'there')
    }

    loadProfile()
  }, [])

  const hour = new Date().getHours()
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
      ? 'Good afternoon'
      : 'Good evening'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex flex-col items-center px-6">

      {/* ───────── Top Identity ───────── */}
      <div className="mt-20 text-center space-y-3">
        <h1 className="text-3xl font-semibold text-gray-900">
          {greeting},{' '}
          <span className="text-indigo-600">
            {name.split(' ')[0]}
          </span>{' '}
          👋
        </h1>

        <p className="text-gray-500 text-base">
          Conversations grow one message at a time.
        </p>
      </div>

      {/* ───────── Core Actions ───────── */}
      <div className="mt-16 w-full max-w-md space-y-6">

        {/* Hero Action */}
        <div
          onClick={() => router.push('/match')}
          className="group cursor-pointer bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl">
              💬
            </div>

            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900">
                Start a Conversation
              </p>
              <p className="text-sm text-gray-500">
                Find a language partner and say hi
              </p>
            </div>

            <span className="text-indigo-400 group-hover:translate-x-1 transition">
              →
            </span>
          </div>
        </div>

        {/* Secondary Action */}
        <div
          onClick={() => router.push('/conversations')}
          className="cursor-pointer bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white">
              📥
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Open Inbox
              </p>
              <p className="text-sm text-gray-500">
                Continue where you left off
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── Emotional Filler (Intentional Space) ───────── */}
      <div className="mt-20 text-center max-w-sm">
        <p className="text-sm text-gray-400 leading-relaxed">
          You don’t need perfect words to begin.  
          Real conversations start with presence, not fluency 🌱
        </p>
      </div>

      {/* ───────── Bottom Spacer ───────── */}
      <div className="flex-1" />
    </div>
  )
}
