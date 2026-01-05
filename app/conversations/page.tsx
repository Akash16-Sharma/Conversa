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

  const openConversationRef = useRef<string | null>(null)

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
      await refreshUnreadCounts(uid, list)
      setLoading(false)
    }

    load()
  }, [])

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

          if (msg.sender_id === userId) return

          setLastMessages(prev => ({
            ...prev,
            [msg.conversation_id]: msg.content,
          }))

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

  const handleOpenChat = (conversationId: string) => {
    openConversationRef.current = conversationId

    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: 0,
    }))

    router.push(`/chat/${conversationId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-10 bg-neutral-200 rounded-lg w-40 animate-pulse" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4 animate-pulse border border-neutral-200">
              <div className="w-14 h-14 rounded-full bg-neutral-200" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-neutral-200 rounded w-36" />
                <div className="h-4 bg-neutral-100 rounded w-56" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-neutral-900 mb-2">No conversations yet</p>
            <p className="text-neutral-600">Start your language journey by connecting with a partner</p>
          </div>
          <button
            onClick={() => router.push('/match')}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:from-teal-700 hover:to-teal-800 active:scale-[0.98]"
          >
            Discover Partners
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">
            Messages
          </h1>
          <span className="text-sm text-neutral-600 bg-white px-3 py-1.5 rounded-full border border-neutral-200">
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </span>
        </div>

        <div className="space-y-2">
          {conversations.map((convo, index) => {
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
                className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-4 group hover:-translate-y-0.5 border border-neutral-200 animate-slide-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                    {otherProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-3 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold truncate transition-colors ${unread > 0 ? 'text-neutral-900' : 'text-neutral-700'} group-hover:text-teal-600`}>
                      {otherProfile?.full_name || 'Unknown User'}
                    </p>
                    {unread > 0 && (
                      <div className="ml-2 min-w-[24px] h-6 px-2 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm truncate transition-colors ${unread > 0 ? 'text-neutral-700 font-medium' : 'text-neutral-500'}`}>
                    {preview || 'Start the conversation'}
                  </p>
                </div>

                <svg className="w-5 h-5 text-neutral-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
