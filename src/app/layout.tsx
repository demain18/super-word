import type { Metadata } from 'next';
import './globals.css';
import EmotionRegistry from './EmotionRegistry';

export const metadata: Metadata = {
  title: '슈퍼워드 | SuperWord - AI 보고서 자동 생성',
  description:
    '직장인을 위한 AI 보고서 자동 생성 서비스. 외근 보고서, 출장 보고서, 회의록, 업무보고서, 실적 보고서를 클릭 몇 번으로 완성하세요.',
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
      </body>
    </html>
  );
}
