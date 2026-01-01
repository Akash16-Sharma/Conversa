'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  getMessages,
  sendMessage,
  markConversationRead,
} from '@/lib/chat'
import { useAuthGuard } from '@/lib/useAuthGuard'

type PresencePayload = {
  presence_ref: string
  typing?: boolean
}

export default function ChatPage() {
  useAuthGuard(true)

  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState('')
  const [otherTyping, setOtherTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  // keep channels isolated
  const messageChannelRef = useRef<any>(null)
  const typingChannelRef = useRef<any>(null)

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  /* ───────────── Initial load ───────────── */
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      setUserId(data.user.id)

      const { data: msgs } = await getMessages(id)
      setMessages(msgs || [])

      // mark read on open
      await markConversationRead(id, data.user.id)
    }

    load()
  }, [id])

  /* ───────────── Realtime messages ───────────── */
  useEffect(() => {
    if (!userId) return

    messageChannelRef.current = supabase
      .channel(`messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        async payload => {
          setMessages(prev => [...prev, payload.new])

          if (payload.new.sender_id !== userId) {
            await markConversationRead(id, userId)
          }
        }
      )
      .subscribe()

    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current)
      }
    }
  }, [id, userId])

  /* ───────────── Typing indicator (presence) ───────────── */
  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel(`typing:${id}`, {
      config: {
        presence: { key: userId },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const others = Object.keys(state).filter(k => k !== userId)

        let typing = false

        others.forEach(key => {
          const entries = state[key] as PresencePayload[]
          entries?.forEach(p => {
            if (p.typing) typing = true
          })
        })

        setOtherTyping(typing)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ typing: false })
        }
      })

    typingChannelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [id, userId])

  /* ───────────── Auto scroll ───────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, otherTyping])

  /* ───────────── Typing handler ───────────── */
  const handleTyping = (value: string) => {
    setText(value)

    if (!isTypingRef.current) {
      isTypingRef.current = true
      typingChannelRef.current?.track({ typing: true })
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }

    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false
      typingChannelRef.current?.track({ typing: false })
    }, 1000)
  }

  /* ───────────── Send message ───────────── */
  const handleSend = async () => {
    if (!text.trim()) return

    await sendMessage(id, userId, text)
    setText('')

    isTypingRef.current = false
    typingChannelRef.current?.track({ typing: false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex justify-center py-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center gap-3">
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
            <p className="font-medium text-gray-900">Conversation</p>
            <p className="text-xs text-gray-500">
              {otherTyping ? 'Typing…' : 'Active now'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
          {messages.map(msg => {
            const isMine = msg.sender_id === userId
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[70%]
                    ${
                      isMine
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}

          {otherTyping && (
            <div className="flex items-center gap-1 ml-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t">
          <div className="flex gap-3 bg-gray-50 rounded-full px-4 py-2 shadow-inner">
            <input
              value={text}
              onChange={e => handleTyping(e.target.value)}
              placeholder="Type something thoughtful…"
              className="flex-1 bg-transparent focus:outline-none text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
