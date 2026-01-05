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

      const { data: myProfile } = await getProfile(data.user.id)
      setProfile(myProfile)

      const { data: results } = await getMatches(myProfile)
      setMatches(results || [])

      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2 animate-pulse">
            <div className="h-10 bg-neutral-200 rounded-lg w-64 mx-auto" />
            <div className="h-5 bg-neutral-100 rounded w-80 mx-auto" />
          </div>

          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-6 space-y-5 animate-pulse border border-neutral-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-neutral-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-neutral-200 rounded w-40" />
                  <div className="h-4 bg-neutral-100 rounded w-52" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-10 bg-neutral-100 rounded-xl w-full" />
                <div className="h-10 bg-neutral-100 rounded-xl w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold text-neutral-900">
            Discover Language Partners
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Connect with people learning your language and help each other grow
          </p>
        </div>

        {matches.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center space-y-4 border border-neutral-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-900 mb-2">
                No matches found yet
              </p>
              <p className="text-neutral-600">
                More language learners join every day. Check back soon or update your profile to find better matches.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {matches.map((user, index) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 space-y-5 transition-all duration-300 hover:-translate-y-1 border border-neutral-200 animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      {user.full_name || 'Anonymous Learner'}
                    </h2>
                    <p className="text-sm text-neutral-600 mt-0.5">
                      Language exchange partner
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                      Speaks
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-2 rounded-lg bg-teal-100 text-teal-800 text-sm font-semibold border border-teal-200">
                      {user.native_language}
                    </span>
                    {user.native_level && (
                      <span className="px-3 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200">
                        {user.native_level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                      Learning
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-2 rounded-lg bg-orange-100 text-orange-800 text-sm font-semibold border border-orange-200">
                      {user.learning_language}
                    </span>
                    {user.learning_level && (
                      <span className="px-3 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200">
                        {user.learning_level}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="pt-2 border-t border-neutral-100">
                  <p className="text-sm text-neutral-700 leading-relaxed italic">
                    "{user.bio}"
                  </p>
                </div>
              )}

              <button
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:from-teal-700 hover:to-teal-800 active:scale-[0.98] flex items-center justify-center gap-2"
                onClick={async () => {
                  if (!profile) return
                  const conversation = await getOrCreateConversation(
                    profile.id,
                    user.id
                  )
                  router.push(`/chat/${conversation.id}`)
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Start Conversation</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
