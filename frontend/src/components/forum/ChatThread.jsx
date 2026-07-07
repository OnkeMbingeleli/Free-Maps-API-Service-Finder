import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

// Real-time chat/forum thread — Supabase Realtime channel per thread.id
// (blueprint §5 CHAT FORUM).
export default function ChatThread({ threadId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let channel;

    async function load() {
      const { data } = await supabase
        .from('forum_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      setMessages(data || []);

      channel = supabase
        .channel(`thread-${threadId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'forum_messages', filter: `thread_id=eq.${threadId}` },
          (payload) => setMessages((prev) => [...prev, payload.new])
        )
        .subscribe();
    }

    load();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [threadId]);

  async function sendMessage() {
    if (!draft.trim() || !user) return;
    await supabase.from('forum_messages').insert({
      thread_id: threadId,
      user_id: user.id,
      message: draft.trim(),
    });
    setDraft('');
  }

  return (
    <div className="chat-thread">
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className="chat-message">
            {m.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Write an update…"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
