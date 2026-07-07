import { supabaseAdmin } from '../config/supabase.js';

// GET /api/services?type=clinic&status=approved
export async function listServices(req, res, next) {
  try {
    const { type, verified } = req.query;
    let query = supabaseAdmin.from('services').select('*').eq('status', 'approved');
    if (type) query = query.eq('type', type);
    if (verified !== undefined) query = query.eq('verified', verified === 'true');
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/services/suggest — logged-in users suggest a new service
// (writes to service_suggestions, admin reviews before it becomes a real service)
export async function suggestService(req, res, next) {
  try {
    const { name, type, lat, lng, notes } = req.body;
    if (!name || !type || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'name, type, lat, lng are required' });
    }
    const { data, error } = await supabaseAdmin
      .from('service_suggestions')
      .insert({ name, type, lat, lng, notes, submitted_by: req.user.id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/services/:id/report — Waze-style "closed / wrong info / queue long"
export async function reportService(req, res, next) {
  try {
    const { id } = req.params;
    const { report_type, description } = req.body;
    const { data, error } = await supabaseAdmin
      .from('service_reports')
      .insert({ service_id: id, user_id: req.user.id, report_type, description })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}
