import { useEffect, useState } from 'react';
import { apiFetch } from '../http';

export function useHealth() {
  const [status, setStatus] = useState<'ok' | 'error' | 'loading'>('loading');

  useEffect(() => {
    apiFetch<{ ok: boolean }>('/health')
      .then((res) => setStatus(res.ok ? 'ok' : 'error'))
      .catch(() => setStatus('error'));
  }, []);

  return status;
}
