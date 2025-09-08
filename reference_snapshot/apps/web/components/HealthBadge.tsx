'use client';
import React from 'react';
import { useHealth } from '../lib/hooks/useHealth';

export function HealthBadge() {
  const status = useHealth();

  const color =
    status === 'ok' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500';

  return (
    <span className={`inline-block px-2 py-1 rounded text-white text-xs ${color}`}>
      API: {status}
    </span>
  );
}
