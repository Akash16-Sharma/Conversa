'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    setError(null)

    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)

    const loginResult = await signIn(email, password)

    if (loginResult.error) {
      const signupResult = await signUp(email, password)

      if (signupResult.error) {
        setError(signupResult.error.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    router.replace('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-rose-50 px-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-6 relative z-10 animate-scale-in border border-gray-100">

        {/* App Title */}
        <div className="text-center space-y-2">
          <div className="inline-block text-5xl mb-2 animate-bounce-slow">💬</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
            Conversa
          </h1>
          <p className="text-sm text-gray-500">
            Practice languages with real people
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleContinue()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleContinue()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-shake">
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-rose-600 text-white py-3.5 rounded-xl font-medium shadow-lg disabled:opacity-50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Please wait…
            </span>
          ) : (
            'Continue'
          )}
        </button>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          New here? We'll create an account automatically.
        </p>
      </div>

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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
