// server.js - Mirror of Truth
// Express backend that conjures harsh philosophical quotes via Claude.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', 1);

// ---------- Middleware ----------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

function resolveCorsOrigin(origin, callback) {
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  return callback(new Error('Origin not allowed by CORS'));
}

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  next();
});

app.use(cors({
  origin: resolveCorsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '32kb' }));
app.use(express.static(PUBLIC_DIR, {
  etag: true,
  maxAge: isProduction ? '1d' : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  },
}));

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 40;
const quoteHits = new Map();

function rateLimitQuote(req, res, next) {
  const now = Date.now();
  const key = req.ip || 'anonymous';
  const record = quoteHits.get(key);
  const current = record && record.resetAt > now
    ? record
    : { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  current.count += 1;
  quoteHits.set(key, current);

  if (quoteHits.size > 500) {
    for (const [hitKey, hitRecord] of quoteHits.entries()) {
      if (hitRecord.resetAt <= now) quoteHits.delete(hitKey);
    }
  }

  res.setHeader('RateLimit-Limit', String(RATE_LIMIT_MAX));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, RATE_LIMIT_MAX - current.count)));

  if (current.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too many requests. Let the mirror cool down for a moment.' });
  }

  next();
}

// ---------- Gemini client ----------
function readApiKey() {
  const raw = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const trimmed = raw.trim();
  // Treat obvious placeholders as missing so the UI/server don't lie.
  if (!trimmed) return '';
  if (/^(your[_-]?key[_-]?here|placeholder|changeme|xxx+|sk-?xxx)/i.test(trimmed)) return '';
  return trimmed;
}
const apiKey = readApiKey();
if (!apiKey) {
  console.warn('[mirror-of-truth] No real GEMINI_API_KEY/API_KEY set in .env - /api/quote will return 503 until you replace the placeholder.');
}
const genAI = new GoogleGenerativeAI(apiKey || 'missing-placeholder');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

const SYSTEM_PROMPT =
  "You are a timeless voice of ancient wisdom - unflinching and merciless with truth. " +
  "You produce harsh, philosophical quotes that sting because they are TRUE. " +
  "No cliches. No motivational poster energy. Sound like a mirror, not a mentor.";

function buildUserPrompt({ source, language, tone, topic }) {
  return (
    `Generate one original quote in the style of ${source}, written in ${language}, ` +
    `with a ${tone} tone, about ${topic}. 2-4 sentences max. ` +
    `If language is not English, write the quote in that language first, ` +
    `then on the next line write: (English: [translation]). ` +
    `End with exactly: [ATTR: ${source} - ${language}]. ` +
    `Return ONLY the quote and ATTR line.`
  );
}

// Pull the "[ATTR: ...]" trailer off Claude's reply and return { quote, attr }.
function splitQuoteAndAttr(raw) {
  if (typeof raw !== 'string') return { quote: '', attr: '' };
  const text = raw.trim();
  // Match the ATTR line, possibly on its own line or with extra whitespace.
  const match = text.match(/\[\s*ATTR\s*:\s*([^\]]+)\s*\]\s*\.?\s*$/i);
  if (!match) return { quote: text, attr: '' };
  const attr = match[1].trim();
  const quote = text.slice(0, match.index).trim();
  return { quote, attr };
}

function normalizeField(value, maxLength) {
  if (typeof value !== 'string') return '';
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.length > maxLength) return '';
  return normalized;
}

// ---------- Routes ----------
app.get('/health', (_req, res) => {
  res.json({ ok: true, model: MODEL, hasKey: Boolean(apiKey) });
});

app.post('/api/quote', rateLimitQuote, async (req, res) => {
  const payload = {
    source: normalizeField(req.body && req.body.source, 80),
    language: normalizeField(req.body && req.body.language, 80),
    tone: normalizeField(req.body && req.body.tone, 80),
    topic: normalizeField(req.body && req.body.topic, 120),
  };

  // Light validation: keep it flexible, but reject empty or oversized input.
  if (!payload.source || !payload.language || !payload.tone || !payload.topic) {
    return res.status(400).json({
      error: 'Missing or invalid fields. Required: source, language, tone, topic.',
    });
  }

  if (!apiKey) {
    return res.status(503).json({
      error: 'Server is missing a real GEMINI_API_KEY. Edit the .env file and restart.',
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_PROMPT
    });
    
    const result = await model.generateContent(buildUserPrompt(payload));
    const raw = result.response.text();
    const { quote, attr } = splitQuoteAndAttr(raw);

    if (!quote) {
      return res.status(502).json({ error: 'The oracle returned an empty reply. Try again.' });
    }

    res.json({ quote, attr });
  } catch (err) {
    console.error('[mirror-of-truth] /api/quote failed:', err);
    const status = err && err.status ? err.status : 500;
    const message =
      (err && err.error && err.error.error && err.error.error.message) ||
      (err && err.message) ||
      'Unknown error talking to the oracle.';
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

// Friendly 404 for unknown API routes (static 404s still work via Express).
app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API route.' }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use((err, _req, res, _next) => {
  if (err && err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed by CORS.' });
  }
  console.error('[mirror-of-truth] unhandled server error:', err);
  return res.status(500).json({ error: 'Unexpected server error.' });
});

// ---------- Start ----------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[mirror-of-truth] listening on http://localhost:${PORT}`);
    console.log(`[mirror-of-truth] model: ${MODEL}`);
    console.log(`[mirror-of-truth] API key present: ${Boolean(apiKey)}`);
  });
}

module.exports = app;
