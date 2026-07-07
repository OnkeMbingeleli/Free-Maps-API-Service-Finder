import { supabaseAdmin } from '../config/supabase.js';

export async function listThreads(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('forum_threads')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createThread(req, res, next) {
  try {
    const { title, service_id } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const { data, error } = await supabaseAdmin
      .from('forum_threads')
      .insert({ title, service_id, created_by: req.user.id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function postMessage(req, res, next) {
  try {
    const { threadId } = req.params;
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message is required' });
    const { data, error } = await supabaseAdmin
      .from('forum_messages')
      .insert({ thread_id: threadId, user_id: req.user.id, message: message.trim() })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function flagMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const { error } = await supabaseAdmin
      .from('forum_messages')
      .update({ flagged: true })
      .eq('id', messageId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
