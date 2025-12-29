'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthGuard } from '@/lib/useAuthGuard'
import { supabase } from '@/lib/supabaseClient'
import { getProfile } from '@/lib/profile'
import { getMatches } from '@/lib/match'
import { getOrCreateConversation } from '@/lib/chat'

export default function MatchPage() {
  useAuthGuard(true)

  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      // Load my profile
      const { data: myProfile } = await getProfile(data.user.id)
      setProfile(myProfile)

      // Load matches
      const { data: results } = await getMatches(myProfile)
      setMatches(results || [])

      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <p className="text-gray-500">Finding language partners…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Language Partners
          </h1>
          <p className="text-sm text-gray-500">
            People you might enjoy learning with
          </p>
        </div>

        {/* Empty State */}
        {matches.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-600">
              No matches yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              More learners are joining every day
            </p>
          </div>
        )}

        {/* Match Cards */}
        <div className="space-y-5">
          {matches.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-sm p-5 space-y-4 transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {user.full_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Language exchange partner
                  </p>
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    🌍 Speaks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs">
                      {user.native_language}
                    </span>
                    {user.native_level && (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                        {user.native_level}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    📚 Learning
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs">
                      {user.learning_language}
                    </span>
                    {user.learning_level && (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                        {user.learning_level}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-gray-600 italic">
                  “{user.bio}”
                </p>
              )}

              {/* CTA */}
              <button
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-2.5 rounded-xl font-medium shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                onClick={async () => {
                  if (!profile) return

                  const conversation = await getOrCreateConversation(
                    profile.id, // me
                    user.id     // other user
                  )

                  router.push(`/chat/${conversation.id}`)
                }}
              >
                Say Hi 👋
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
