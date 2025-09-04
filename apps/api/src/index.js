import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const DEMO_MODE = (process.env.DEMO_MODE || 'true') === 'true';

app.get('/demo', (req, res) => {
  res.json({ demo: DEMO_MODE, message: 'EarlyBird API demo is running' });
});

app.get('/analytics/calls', (req, res) => {
  // deterministic demo metrics
  const now = Date.now();
  const mk = (i, outcome, dur=180) => ({
    id: `demo-${i}`,
    startedAt: new Date(now - i*3600_000).toISOString(),
    durationSec: dur,
    outcome,
    cost: 0.06,
    revenue: 0.30,
    margin: 0.24,
  });
  res.json([mk(1,'booked'), mk(2,'answered'), mk(3,'transferred'), mk(4,'booked'), mk(5,'voicemail')]);
});

app.get('/transcripts', (req, res) => {
  res.json({
    items: [
      { id: 'demo-1', startedAt: new Date().toISOString(), preview: 'Caller: I need to reschedule my appointment...' },
      { id: 'demo-2', startedAt: new Date(Date.now() - 86400000).toISOString(), preview: 'Caller: What are your hours today?' },
    ]
  });
});

app.get('/billing/invoices/:id/pdf', (req, res) => {
  const { id } = req.params;
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]/Contents 4 0 R>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 18 Tf 50 100 Td (Demo Invoice '+id+') Tj ET\nendstream\nendobj\ntrailer<</Root 1 0 R>>\n%%EOF','binary');
  res.setHeader('Content-Type','application/pdf');
  res.send(pdf);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`[earlybird-api] listening on :${port} (DEMO_MODE=${DEMO_MODE})`));
