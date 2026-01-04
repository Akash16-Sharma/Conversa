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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-rose-50 px-4 py-10">
        <div className="max-w-md mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-rose-50 px-4 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-6xl animate-bounce-slow">💬</div>
          <p className="text-gray-600 font-medium">No conversations yet</p>
          <p className="text-sm text-gray-400">Start chatting with language partners</p>
          <button
            onClick={() => router.push('/match')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-rose-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Find Partners
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-rose-50 px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900 animate-fade-in">
          Inbox
        </h1>

        <div className="space-y-3">
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
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-4 group hover:-translate-y-1 border border-gray-100 animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-rose-500 flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                    {otherProfile?.full_name?.[0] || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate transition-colors ${unread > 0 ? 'text-gray-900' : 'text-gray-700'} group-hover:text-blue-700`}>
                    {otherProfile?.full_name || 'Unknown User'}
                  </p>
                  <p className={`text-sm truncate transition-colors ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {preview || 'No messages yet'}
                  </p>
                </div>

                {/* Unread badge */}
                {unread > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                      <span className="text-xs font-bold text-white">
                        {unread}
                      </span>
                    </div>
                  </div>
                )}

                {/* Arrow indicator */}
                <div className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300">
                  →
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out backwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
