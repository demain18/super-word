import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getBalance, listDownloadHistory } from '@/lib/points';
import { getTossClientKey } from '@/lib/toss-config';
import PointClient from './PointClient';

export default async function PointPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const [balance, history] = await Promise.all([
    getBalance(user.id),
    listDownloadHistory(user.id),
  ]);

  const clientKey = getTossClientKey();

  return (
    <PointClient
      user={user}
      initialBalance={balance}
      initialHistory={history}
      tossClientKey={clientKey}
    />
  );
}
