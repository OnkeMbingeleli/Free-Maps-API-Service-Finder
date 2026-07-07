import { supabaseAdmin } from '../config/supabase.js';

// Verifies the Supabase JWT sent by the frontend and attaches
// req.user + req.profile (with role) for downstream route guards.
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  req.user = data.user;
  req.profile = profile;
  next();
}

// Role guard — use after requireAuth, e.g. requireRole('admin','moderator')
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.profile || !allowedRoles.includes(req.profile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
