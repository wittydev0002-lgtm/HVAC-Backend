require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const TO_EMAIL = 'info@seasheatingandac.com';
// Must be a verified sender identity in SendGrid (Single Sender or authenticated domain)
const FROM_EMAIL = 'info@seasheatingandac.com';

const MAX_LENGTHS = { name: 100, title: 200, description: 5000 };

// Origins allowed to call this API from the browser
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://seasheatingandac.com',
  'https://www.seasheatingandac.com',
];

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json({ limit: '50kb' }));

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/contact', async (req, res) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error('SENDGRID_API_KEY is not set');
    return res.status(500).json({ error: 'Email service is not configured' });
  }

  const body = req.body || {};
  const name = String(body.name || '').trim();
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();

  if (!name || !title || !description) {
    return res.status(400).json({ error: 'Name, title, and description are required' });
  }
  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    if (String(body[field] || '').length > max) {
      return res.status(400).json({ error: `The ${field} field is too long` });
    }
  }

  const text = [
    'New contact form submission from seasheatingandac.com',
    '',
    `Name: ${name}`,
    `Title: ${title}`,
    '',
    'Description:',
    description,
  ].join('\n');

  const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Title:</strong> ${escapeHtml(title)}</p>
    <p><strong>Description:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(description)}</p>
  `;

  try {
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: TO_EMAIL }] }],
        from: { email: FROM_EMAIL, name: 'Seas Heating and AC Website' },
        subject: `Website inquiry from ${name}: ${title}`,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    });

    if (!sgResponse.ok) {
      const detail = await sgResponse.text();
      console.error('SendGrid error', sgResponse.status, detail);
      return res.status(502).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('SendGrid request failed', err);
    return res.status(502).json({ error: 'Failed to send message' });
  }
});

app.listen(PORT, () => {
  console.log(`HVAC backend running at http://localhost:${PORT}`);
});
