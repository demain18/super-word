import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCreditsSummary, listDownloadHistory } from '@/lib/passes';
import { getTossClientKey } from '@/lib/toss-client';
import PointClient from './PointClient';

export default async function PointPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const [summary, history] = await Promise.all([
    getCreditsSummary(user.id),
    listDownloadHistory(user.id),
  ]);

  const clientKey = getTossClientKey();

  return (
    <PointClient
      user={user}
      initialTotalCredits={summary.totalCredits}
      initialPasses={summary.passes}
      initialHistory={history}
      tossClientKey={clientKey}
    />
  );
}
