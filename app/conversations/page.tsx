'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthGuard } from '@/lib/useAuthGuard'
import {
  getConversations,
  getUnreadCount,
  getLastMessage,
} from '@/lib/chat'

export default function ConversationsPage() {
  useAuthGuard(true)

  const router = useRouter()

  const [userId, setUserId] = useState('')
  const [conversations, setConversations] = useState<any[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  // Track which conversation is currently open
  const openConversationRef = useRef<string | null>(null)

  /* ───────────────── Refresh unread from DB ───────────────── */
  const refreshUnreadCounts = async (
    uid: string,
    convos: any[]
  ) => {
    const unreadMap: Record<string, number> = {}

    for (const convo of convos) {
      unreadMap[convo.id] = await getUnreadCount(convo.id, uid)
    }

    setUnreadCounts(unreadMap)
  }

  /* ───────────────── Initial load ───────────────── */
  useEffect(() => {
    const load = async () => {
      openConversationRef.current = null

      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      const uid = data.user.id
      setUserId(uid)

      const { data: convos } = await getConversations(uid)
      const list = convos || []
      setConversations(list)

      const lastMsgMap: Record<string, string> = {}

      for (const convo of list) {
        const { data: last } = await getLastMessage(convo.id)
        if (last?.content) {
          lastMsgMap[convo.id] = last.content
        }
      }

      setLastMessages(lastMsgMap)

      // Always sync unread from DB
      await refreshUnreadCounts(uid, list)

      setLoading(false)
    }

    load()
  }, [])

  /* ───────────────── Realtime unread increment ───────────────── */
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('inbox-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          const msg = payload.new

          // Ignore my own messages
          if (msg.sender_id === userId) return

          // Update last message preview
          setLastMessages(prev => ({
            ...prev,
            [msg.conversation_id]: msg.content,
          }))

          // Increment unread if chat not open
          if (openConversationRef.current !== msg.conversation_id) {
            setUnreadCounts(prev => ({
              ...prev,
              [msg.conversation_id]:
                (prev[msg.conversation_id] || 0) + 1,
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  /* ───────────────── Open chat ───────────────── */
  const handleOpenChat = (conversationId: string) => {
    openConversationRef.current = conversationId

    // Optimistic UI reset
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: 0,
    }))

    router.push(`/chat/${conversationId}`)
  }

  /* ───────────────── UI states ───────────────── */
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

  /* ───────────────── Render ───────────────── */
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

            const unread = unreadCounts[convo.id] || 0
            const preview = lastMessages[convo.id]

            return (
              <div
                key={convo.id}
                onClick={() => handleOpenChat(convo.id)}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {otherProfile?.full_name?.[0] || 'U'}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {otherProfile?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {preview || 'No messages yet'}
                  </p>
                </div>

                {/* Unread badge */}
                {unread > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600">
                      {unread}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
