import { createClient } from '@/lib/supabase/server';
import { getCreditsSummary } from '@/lib/passes';
import HomeClient from './HomeClient';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 상태면 서버에서 이용권을 미리 받아 첫 페인트부터 정확한 값으로 렌더한다.
  // (클라이언트 fetch 전까지 0회가 잠깐 보이는 플래시 방지)
  let initialCredits: number | null = null;
  if (user) {
    try {
      initialCredits = (await getCreditsSummary(user.id)).totalCredits;
    } catch {
      initialCredits = null;
    }
  }

  return <HomeClient initialUser={user} initialCredits={initialCredits} />;
}
