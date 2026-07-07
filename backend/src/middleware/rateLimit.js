import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

// Tighter limit on auth endpoints (login/signup) to blunt brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, try again later.' },
});

// Forum posting limit — one message per 3 seconds per IP (blueprint §5)
export const forumPostLimiter = rateLimit({
  windowMs: 3 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are posting too fast.' },
});
