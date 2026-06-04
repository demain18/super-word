'use client';

import { useRouter } from 'next/navigation';

/** 브라우저 히스토리 기준 한 페이지 뒤로 이동하는 버튼. */
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: '#565959',
        fontSize: 13,
        fontFamily: 'inherit',
      }}
    >
      ← 뒤로
    </button>
  );
}
