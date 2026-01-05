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
    <div className="min-h-screen bg-neutral-100 flex justify-center">
      <div className="w-full max-w-4xl bg-white flex flex-col shadow-2xl">
        <div className="sticky top-0 z-10 px-6 py-4 bg-white border-b border-neutral-200 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-neutral-900">Language Partner</p>
            <p className="text-sm text-neutral-600">
              {otherTyping ? 'typing...' : 'online'}
            </p>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto bg-neutral-50">
          {messages.map(msg => {
            const isMine = msg.sender_id === userId
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm max-w-[75%] shadow-sm ${
                    isMine
                      ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-br-md'
                      : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}

          {otherTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-200 px-5 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-neutral-200 shadow-lg">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                value={text}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type your message..."
                className="w-full border border-neutral-300 rounded-xl px-4 py-3 pr-12 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="shrink-0 w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 disabled:from-neutral-300 disabled:to-neutral-400 text-white rounded-xl font-semibold shadow-lg disabled:shadow-none transition-all hover:shadow-xl active:scale-95 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2 text-center">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}
