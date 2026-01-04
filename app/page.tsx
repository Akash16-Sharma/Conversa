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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50 flex flex-col items-center px-6 overflow-hidden">

      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Top Identity */}
      <div className={`mt-20 text-center space-y-3 relative z-10 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <h1 className="text-3xl font-semibold text-gray-900">
          {greeting},{' '}
          <span className="bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent animate-gradient">
            {name.split(' ')[0]}
          </span>{' '}
          <span className="inline-block animate-wave">👋</span>
        </h1>

        <p className="text-gray-500 text-base animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Conversations grow one message at a time.
        </p>
      </div>

      {/* Core Actions */}
      <div className={`mt-16 w-full max-w-md space-y-6 relative z-10 transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Hero Action */}
        <div
          onClick={() => router.push('/match')}
          className="group cursor-pointer bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl shadow-lg group-hover:shadow-blue-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
              💬
            </div>

            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                Start a Conversation
              </p>
              <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                Find a language partner and say hi
              </p>
            </div>

            <span className="text-blue-400 group-hover:translate-x-2 transition-all duration-300 text-xl group-hover:text-blue-600">
              →
            </span>
          </div>
        </div>

        {/* Secondary Action */}
        <div
          onClick={() => router.push('/conversations')}
          className="cursor-pointer bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98] border border-gray-100"
        >
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md group-hover:shadow-rose-300 transition-all duration-300 group-hover:scale-110">
              📥
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900 group-hover:text-rose-700 transition-colors">
                Open Inbox
              </p>
              <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                Continue where you left off
              </p>
            </div>

            <span className="text-gray-300 group-hover:translate-x-1 transition-all duration-300">
              →
            </span>
          </div>
        </div>
      </div>

      {/* Emotional Filler */}
      <div className={`mt-20 text-center max-w-sm relative z-10 transition-all duration-700 delay-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-sm text-gray-400 leading-relaxed">
          You don't need perfect words to begin.
          Real conversations start with presence, not fluency <span className="inline-block animate-pulse">🌱</span>
        </p>
      </div>

      <div className="flex-1" />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(0.9); }
          66% { transform: translate(30px, -20px) scale(1.1); }
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

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-wave {
          display: inline-block;
          animation: wave 2s ease-in-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
