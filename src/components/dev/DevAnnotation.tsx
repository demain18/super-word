'use client';

import { Agentation } from 'agentation';

/**
 * Agentation 비주얼 피드백 툴 — 개발 환경에서만 마운트.
 * 화면 요소를 클릭해 주석을 달고 구조화된 컨텍스트를 AI 코딩 에이전트에 전달한다.
 * 프로덕션 빌드에서는 아무것도 렌더하지 않는다.
 */
export default function DevAnnotation() {
  if (process.env.NODE_ENV === 'production') return null;
  return <Agentation />;
}
