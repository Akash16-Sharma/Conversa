'use client'

import { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getMessages, sendMessage } from '@/lib/chat'
import { useAuthGuard } from '@/lib/useAuthGuard'

export default function ChatPage() {
  useAuthGuard(true)

  const { id } = useParams()
  const router = useRouter()

  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // 🔹 Load messages + setup realtime
  useEffect(() => {
    let channel: RealtimeChannel

    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      setUserId(data.user.id)

      // 1️⃣ Initial fetch
      const { data: msgs } = await getMessages(id as string)
      setMessages(msgs || [])

      // 2️⃣ Realtime subscription
      channel = supabase
        .channel(`chat:${id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${id}`,
          },
          payload => {
            setMessages(prev => [...prev, payload.new])
          }
        )
        .subscribe()
    }

    load()

    // 3️⃣ Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [id])

  // 🔹 Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 🔹 Send message (NO re-fetch)
  const handleSend = async () => {
    if (!text.trim()) return

    await sendMessage(id as string, userId, text)
    setText('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex justify-center py-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center gap-3 bg-white">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-700"
          >
            ←
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Conversation
            </p>
            <p className="text-xs text-gray-500">
              Active now
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-indigo-50/30">
          {messages.map((msg, i) => {
            const isMine = msg.sender_id === userId
            const prev = messages[i - 1]
            const isGrouped =
              prev && prev.sender_id === msg.sender_id

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`px-4 py-2 text-sm leading-relaxed max-w-[70%]
                    ${
                      isMine
                        ? `bg-indigo-600 text-white ${
                            isGrouped
                              ? 'rounded-2xl'
                              : 'rounded-2xl rounded-br-md'
                          }`
                        : `bg-gray-100 text-gray-800 ${
                            isGrouped
                              ? 'rounded-2xl'
                              : 'rounded-2xl rounded-bl-md'
                          }`
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t">
          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 shadow-inner">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type something thoughtful…"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
