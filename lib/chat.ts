import { supabase } from './supabaseClient'

/**
 * Get existing conversation between two users
 * or create one if it does not exist
 */
export async function getOrCreateConversation(
  me: string,
  other: string
) {
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(user_one.eq.${me},user_two.eq.${other}),
       and(user_one.eq.${other},user_two.eq.${me})`
    )

  if (existing && existing.length > 0) {
    return existing[0]
  }

  const { data: created } = await supabase
    .from('conversations')
    .insert({
      user_one: me,
      user_two: other,
    })
    .select()
    .single()

  return created
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string) {
  return supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  return supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  })
}
export async function getConversations(userId: string) {
  return supabase
    .from('conversations')
    .select(`
      id,
      user_one,
      user_two,
      created_at,
      user_one_profile:profiles!conversations_user_one_fkey(
        id,
        full_name
      ),
      user_two_profile:profiles!conversations_user_two_fkey(
        id,
        full_name
      )
    `)
    .or(`user_one.eq.${userId},user_two.eq.${userId}`)
    .order('created_at', { ascending: false })
}


