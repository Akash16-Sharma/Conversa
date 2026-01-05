'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { createProfile, getProfile, updateProfile } from '@/lib/profile'
import { useAuthGuard } from '@/lib/useAuthGuard'

const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Chinese',
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Native']

export default function ProfilePage() {
  useAuthGuard()

  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      const { data: profileData } = await getProfile(data.user.id)

      if (!profileData) {
        const { data: newProfile } = await createProfile(
          data.user.id,
          data.user.email
        )
        setProfile(newProfile)
      } else {
        setProfile(profileData)
      }
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await updateProfile(profile.id, profile)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Your Language Profile
          </h1>
          <p className="text-neutral-600">
            Help others understand your language goals and background
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-2 border border-neutral-200">
          <label htmlFor="name" className="block text-sm font-semibold text-neutral-900 mb-2">
            Display Name
          </label>
          <input
            id="name"
            className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            value={profile.full_name || ''}
            onChange={e =>
              setProfile({ ...profile, full_name: e.target.value })
            }
            placeholder="How should people address you?"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <p className="text-sm font-semibold text-neutral-900">
              Languages I speak
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() =>
                  setProfile({ ...profile, native_language: lang })
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  profile.native_language === lang
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                    : 'border-neutral-200 text-neutral-700 hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {LEVELS.map(level => (
              <button
                key={level}
                onClick={() =>
                  setProfile({ ...profile, native_level: level })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  profile.native_level === level
                    ? 'bg-teal-100 text-teal-800 border-teal-200'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm font-semibold text-neutral-900">
              Languages I'm learning
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() =>
                  setProfile({ ...profile, learning_language: lang })
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  profile.learning_language === lang
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                    : 'border-neutral-200 text-neutral-700 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {LEVELS.map(level => (
              <button
                key={level}
                onClick={() =>
                  setProfile({ ...profile, learning_level: level })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  profile.learning_level === level
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3 border border-neutral-200">
          <label htmlFor="bio" className="block text-sm font-semibold text-neutral-900">
            About you
          </label>
          <textarea
            id="bio"
            rows={4}
            className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
            value={profile.bio || ''}
            onChange={e =>
              setProfile({ ...profile, bio: e.target.value })
            }
            placeholder="Share why you're learning this language, your interests, or conversation topics you'd enjoy..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:from-teal-700 hover:to-teal-800 active:scale-[0.98]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-fade-in">
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-green-700">
                Profile updated successfully
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
