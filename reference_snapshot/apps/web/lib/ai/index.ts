export type LLMVendor = 'openai' | 'azure-openai';

export async function generateText({ prompt }: { prompt: string }): Promise<string> {
  const vendor = (process.env.LLM_VENDOR || '').toLowerCase() as LLMVendor;
  if (!vendor) throw new Error('LLM_VENDOR not set');
  switch (vendor) {
    case 'openai':
      return callOpenAI(prompt);
    case 'azure-openai':
      return callAzureOpenAI(prompt);
    default:
      throw new Error(`Unsupported LLM_VENDOR: ${vendor}`);
  }
}

async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Missing OPENAI_API_KEY');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 256
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'OpenAI error');
  return String(json?.choices?.[0]?.message?.content ?? '');
}

async function callAzureOpenAI(prompt: string): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!endpoint || !key || !deployment) throw new Error('Missing Azure OpenAI env');
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 256
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Azure OpenAI error');
  return String(json?.choices?.[0]?.message?.content ?? '');
}

export function vendorIsHIPAAEligible(): boolean {
  const v = (process.env.LLM_VENDOR || '').toLowerCase();
  if (v === 'azure-openai') return true;
  if (v === 'openai') return process.env.OPENAI_BAA === 'true';
  return false;
}
