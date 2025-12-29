'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'
import { getProfile } from './profile'

export function useAuthGuard(requireProfile = false) {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        router.replace('/login')
        return
      }

      if (requireProfile) {
        const { data: profile } = await getProfile(user.id)
        if (!profile) {
          router.replace('/profile')
        }
      }
    }

    check()
  }, [router, requireProfile])
}
