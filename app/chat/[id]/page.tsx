'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getMessages, sendMessage } from '@/lib/chat'
import { useAuthGuard } from '@/lib/useAuthGuard'

type PresencePayload = {
  presence_ref: string
  typing?: boolean
  last_seen?: number
}

export default function ChatPage() {
  useAuthGuard(true)

  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState('')
  const [otherTyping, setOtherTyping] = useState(false)
  const [lastSeen, setLastSeen] = useState<number | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingChannelRef = useRef<any>(null)
  const messageChannelRef = useRef<any>(null)
  const isTypingRef = useRef(false)

  /* ─────────────────── Messages + Realtime ─────────────────── */
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      setUserId(data.user.id)

      const { data: msgs } = await getMessages(id)
      setMessages(msgs || [])

      messageChannelRef.current = supabase
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

    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current)
      }
    }
  }, [id])

  /* ─────────────────── Presence (Typing + Last Seen) ─────────────────── */
  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel(`presence:${id}`, {
      config: { presence: { key: userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const others = Object.keys(state).filter(k => k !== userId)

        let typing = false
        let seen: number | null = null

        others.forEach(key => {
          const entries = state[key] as PresencePayload[]
          entries?.forEach(p => {
            if (p.typing) typing = true
            if (p.last_seen) seen = p.last_seen
          })
        })

        setOtherTyping(typing)
        setLastSeen(seen)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            typing: false,
            last_seen: Date.now(),
          })
        }
      })

    typingChannelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [id, userId])

  /* ─────────────────── Auto scroll ─────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, otherTyping])

  /* ─────────────────── Typing (throttled) ─────────────────── */
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
      typingChannelRef.current?.track({
        typing: false,
        last_seen: Date.now(),
      })
    }, 1200)
  }

  /* ─────────────────── Send message ─────────────────── */
  const handleSend = async () => {
    if (!text.trim()) return

    await sendMessage(id, userId, text)
    setText('')
    isTypingRef.current = false

    typingChannelRef.current?.track({
      typing: false,
      last_seen: Date.now(),
    })
  }

  const statusText =
    otherTyping
      ? 'Typing…'
      : lastSeen
      ? `Last seen ${Math.floor((Date.now() - lastSeen) / 1000)}s ago`
      : 'Active now'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex justify-center py-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">
            ←
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div>
            <p className="font-medium text-gray-900">Conversation</p>
            <p className="text-xs text-gray-500">{statusText}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
          {messages.map(msg => {
            const isMine = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] leading-relaxed
                    ${isMine ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}

          {otherTyping && (
            <div className="flex items-center gap-1 text-gray-400 text-sm ml-2">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce delay-150">•</span>
              <span className="animate-bounce delay-300">•</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t bg-white">
          <div className="flex gap-3 bg-gray-50 rounded-full px-4 py-2 shadow-inner">
            <input
              value={text}
              onChange={e => handleTyping(e.target.value)}
              placeholder="Type something thoughtful…"
              className="flex-1 bg-transparent focus:outline-none text-sm"
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
