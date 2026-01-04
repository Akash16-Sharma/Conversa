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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-rose-50 px-4 py-10">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-1 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto" />
            <div className="h-4 bg-gray-100 rounded w-56 mx-auto" />
          </div>

          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-40" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-100 rounded-full w-24" />
                <div className="h-8 bg-gray-100 rounded-full w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-rose-50 px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-1 animate-fade-in">
          <h1 className="text-2xl font-semibold text-gray-900">
            Language Partners
          </h1>
          <p className="text-sm text-gray-500">
            People you might enjoy learning with
          </p>
        </div>

        {/* Empty State */}
        {matches.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-3 animate-fade-in">
            <div className="text-5xl animate-bounce-slow">🔍</div>
            <p className="text-sm text-gray-600 font-medium">
              No matches yet
            </p>
            <p className="text-xs text-gray-400">
              More learners are joining every day
            </p>
          </div>
        )}

        {/* Match Cards */}
        <div className="space-y-5">
          {matches.map((user, index) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-sm p-5 space-y-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100 animate-slide-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-rose-500 flex items-center justify-center text-white font-semibold shadow-lg transition-transform duration-300 group-hover:scale-110">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
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
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    🌍 Speaks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium transition-all duration-300 hover:bg-blue-200 hover:shadow-md hover:scale-105">
                      {user.native_language}
                    </span>
                    {user.native_level && (
                      <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs transition-all duration-300 hover:bg-gray-200">
                        {user.native_level}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    📚 Learning
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium transition-all duration-300 hover:bg-rose-200 hover:shadow-md hover:scale-105">
                      {user.learning_language}
                    </span>
                    {user.learning_level && (
                      <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs transition-all duration-300 hover:bg-gray-200">
                        {user.learning_level}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-gray-600 italic">
                  "{user.bio}"
                </p>
              )}

              {/* CTA */}
              <button
                className="group/btn w-full bg-gradient-to-r from-blue-600 to-rose-600 text-white py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                onClick={async () => {
                  if (!profile) return

                  const conversation = await getOrCreateConversation(
                    profile.id,
                    user.id
                  )

                  router.push(`/chat/${conversation.id}`)
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Say Hi <span className="inline-block group-hover/btn:animate-wave">👋</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-rose-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out backwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-wave {
          display: inline-block;
          animation: wave 2s ease-in-out;
        }
      `}</style>
    </div>
  )
}
