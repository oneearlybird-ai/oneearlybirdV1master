'use client';
import { useEffect, useState } from 'react';

export function useHealth() {
  const [status, setStatus] = useState<'ok' | 'error' | 'loading'>('loading');

  useEffect(() => {
    fetch('/api/upstream/health', { cache: 'no-store' })
      .then((r) => r.json())
      .then((res: { ok?: boolean }) => setStatus(res?.ok ? 'ok' : 'error'))
      .catch(() => setStatus('error'));
  }, []);

  return status;
}
