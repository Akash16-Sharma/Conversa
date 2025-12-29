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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <p className="text-gray-500">Preparing your space…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Nice to meet you 👋
          </h1>
          <p className="text-sm text-gray-500">
            This helps people understand you better
          </p>
        </div>

        {/* Name */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            What should people call you?
          </label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={profile.full_name || ''}
            onChange={e =>
              setProfile({ ...profile, full_name: e.target.value })
            }
            placeholder="Your name"
          />
        </div>

        {/* Native Language */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            🌍 Languages I speak comfortably
          </p>

          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() =>
                  setProfile({ ...profile, native_language: lang })
                }
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  profile.native_language === lang
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {LEVELS.map(level => (
              <button
                key={level}
                onClick={() =>
                  setProfile({ ...profile, native_level: level })
                }
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  profile.native_level === level
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Language */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            📚 Languages I’m learning
          </p>

          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() =>
                  setProfile({ ...profile, learning_language: lang })
                }
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  profile.learning_language === lang
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {LEVELS.map(level => (
              <button
                key={level}
                onClick={() =>
                  setProfile({ ...profile, learning_level: level })
                }
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  profile.learning_level === level
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            💬 A little about me
          </p>
          <textarea
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
            value={profile.bio || ''}
            onChange={e =>
              setProfile({ ...profile, bio: e.target.value })
            }
            placeholder="Why are you learning this language?"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save & Continue'}
        </button>

        {saved && (
          <p className="text-sm text-green-600 text-center">
            Profile saved ✓
          </p>
        )}
      </div>
    </div>
  )
}
