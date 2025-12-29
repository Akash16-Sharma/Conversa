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

    // 1️⃣ Try login first
    const loginResult = await signIn(email, password)

    // 2️⃣ If login fails, try signup
    if (loginResult.error) {
      const signupResult = await signUp(email, password)

      if (signupResult.error) {
        setError(signupResult.error.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)

    // 3️⃣ Redirect to home
    // Guards will decide /profile or /
    router.replace('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-6 space-y-6">

        {/* App Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Conversa</h1>
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
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Please wait…' : 'Continue'}
        </button>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center">
          New here? We’ll create an account automatically.
        </p>
      </div>
    </div>
  )
}
