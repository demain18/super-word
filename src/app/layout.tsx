import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import EmotionRegistry from './EmotionRegistry';
import DevAnnotation from '@/components/dev/DevAnnotation';

export const metadata: Metadata = {
  title: '슈퍼워드 | SuperWord - AI 문서 양식 자동 생성',
  description:
    '직장인을 위한 AI 문서 양식 자동 생성 서비스. 외근·출장·회의록·업무보고·실적부터 견적서·용역 계약서까지 클릭 몇 번으로 완성하세요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <EmotionRegistry>{children}</EmotionRegistry>
        <DevAnnotation />
        <Analytics />
      </body>
    </html>
  );
}
