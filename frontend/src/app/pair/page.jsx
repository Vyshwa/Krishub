'use client';

import { Suspense } from 'react';
import { Pair } from '@/views/Pair';

export default function PairPage() {
  return <Suspense fallback={null}><Pair /></Suspense>;
}
