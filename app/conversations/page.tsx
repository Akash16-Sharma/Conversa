'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthGuard } from '@/lib/useAuthGuard'
import { getConversations, getLastMessage } from '@/lib/chat'

export default function ConversationsPage() {
  useAuthGuard(true)

  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [conversations, setConversations] = useState<any[]>([])
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      setUserId(data.user.id)

      const { data: convos } = await getConversations(data.user.id)
      const conversationList = convos || []
      setConversations(conversationList)

      // 🔹 Fetch last message for each conversation
      const lastMessageMap: Record<string, string> = {}

      for (const convo of conversationList) {
        const { data } = await getLastMessage(convo.id)
        if (data?.content) {
          lastMessageMap[convo.id] = data.content
        }
      }

      setLastMessages(lastMessageMap)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <p className="text-gray-500">Loading your inbox…</p>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <p className="text-gray-500">No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Inbox
        </h1>

        <div className="space-y-3">
          {conversations.map(convo => {
            const isUserOne = convo.user_one === userId
            const otherProfile = isUserOne
              ? convo.user_two_profile
              : convo.user_one_profile

            return (
              <div
                key={convo.id}
                onClick={() => router.push(`/chat/${convo.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {otherProfile?.full_name?.[0] || 'U'}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {otherProfile?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessages[convo.id] || 'No messages yet'}
                  </p>
                </div>

                {/* Chevron */}
                <div className="text-gray-400">›</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
