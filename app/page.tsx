'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthGuard } from '@/lib/useAuthGuard'

export default function HomePage() {
  useAuthGuard(true)

  const router = useRouter()
  const [name, setName] = useState<string>('')
  const [loaded, setLoaded] = useState(false)

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
      setTimeout(() => setLoaded(true), 100)
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
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center px-4 sm:px-6">
      <div className="w-full max-w-2xl mx-auto pt-12 pb-8">
        <div className={`text-center space-y-2 mb-12 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
            {greeting}, <span className="text-teal-600">{name.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-md mx-auto">
            Every conversation is a step forward in your language journey
          </p>
        </div>

        <div className={`space-y-4 transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div
            onClick={() => router.push('/match')}
            className="group cursor-pointer bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-xl font-semibold text-white mb-1">
                  Discover Partners
                </p>
                <p className="text-sm text-teal-50">
                  Find people learning your native language
                </p>
              </div>

              <svg className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => router.push('/conversations')}
              className="group cursor-pointer bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] border border-neutral-200"
            >
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="font-semibold text-neutral-900 mb-1 group-hover:text-teal-600 transition-colors">
                  Messages
                </p>
                <p className="text-sm text-neutral-600">
                  Continue your conversations
                </p>
              </div>
            </div>

            <div
              onClick={() => router.push('/profile')}
              className="group cursor-pointer bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] border border-neutral-200"
            >
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="font-semibold text-neutral-900 mb-1 group-hover:text-teal-600 transition-colors">
                  Your Profile
                </p>
                <p className="text-sm text-neutral-600">
                  Update your languages
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-16 text-center transition-all duration-700 delay-400 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-block px-6 py-3 bg-white rounded-full shadow-sm border border-neutral-200">
            <p className="text-sm text-neutral-700 italic">
              Real fluency comes from real conversations, not perfect grammar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
