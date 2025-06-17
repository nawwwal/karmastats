'use client';

import { Layout } from '@/components/layout/layout';

export default function CalcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
