'use client';

import dynamic from 'next/dynamic';

const DropApp = dynamic(() => import('@/components/DropApp'), { ssr: false });

export default function Home() {
  return <DropApp />;
}
