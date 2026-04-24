'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/common/Button';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface HistoryRow {
  id: string;
  points_spent: number;
  created_at: string;
  report:
    | {
        id: string;
        filename: string;
        version: number;
        label: string | null;
        session_id: string;
        report_type: string | null;
      }
    | Array<{
        id: string;
        filename: string;
        version: number;
        label: string | null;
        session_id: string;
        report_type: string | null;
      }>
    | null;
}

interface Props {
  user: User;
  initialBalance: number;
  initialHistory: HistoryRow[];
  tossClientKey: string;
}

const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeroCard = styled.div`
  background: linear-gradient(135deg, #232f3e 0%, #131921 100%);
  color: #ffffff;
  border-radius: 12px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: ${theme.shadows.elevated};

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
`;

const BalanceLabel = styled.div`
  font-size: 13px;
  opacity: 0.75;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
`;

const BalanceValue = styled.div`
  font-size: 38px;
  font-weight: 800;
  color: ${theme.colors.primary};
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const Unit = styled.span`
  font-size: 18px;
  color: #ffffff;
  font-weight: 600;
`;

const SectionCard = styled.section`
  background: #ffffff;
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 12px;
  box-shadow: ${theme.shadows.card};
  padding: 20px 24px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 14px;
  color: ${theme.colors.textPrimary};
`;

const PresetRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PresetButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.cardBorder)};
  background: ${({ $active }) => ($active ? 'rgba(255,153,0,0.08)' : '#ffffff')};
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: ${theme.colors.textPrimary};
  min-width: 110px;
  transition: all ${theme.transitions.fast};
  &:hover { border-color: ${theme.colors.primary}; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th, td {
    padding: 10px 8px;
    border-bottom: 1px solid ${theme.colors.cardBorder};
    text-align: left;
  }

  th {
    font-weight: 600;
    color: ${theme.colors.textSecondary};
    background: ${theme.colors.backgroundLight};
  }

  td {
    color: ${theme.colors.textPrimary};
  }
`;

const EmptyRow = styled.div`
  padding: 28px 0;
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

const PRESETS = [1000, 5000, 10000];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function formatDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

function fmtNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function reportOf(row: HistoryRow) {
  const r = row.report;
  if (Array.isArray(r)) return r[0] ?? null;
  return r;
}

export default function PointClient({ user, initialBalance, initialHistory, tossClientKey }: Props) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [history, setHistory] = useState<HistoryRow[]>(initialHistory);
  const [chargeAmount, setChargeAmount] = useState<number>(PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/points');
    if (res.ok) {
      const data = await res.json();
      setBalance(data.balance);
      setHistory(data.history);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCharge = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
      const tossPayments = await loadTossPayments(tossClientKey);
      const payment = tossPayments.payment({ customerKey: user.id });
      const orderId = (crypto?.randomUUID?.() ??
        `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: chargeAmount },
        orderId,
        orderName: `포인트 충전 ${fmtNum(chargeAmount)}P`,
        successUrl: `${window.location.origin}/point/payment/success`,
        failUrl: `${window.location.origin}/point/payment/fail`,
        customerName: user.user_metadata?.full_name || user.email || '회원',
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '결제 요청에 실패했습니다.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleRedownload = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '재다운로드 실패');
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert(e instanceof Error ? e.message : '재다운로드에 실패했습니다.');
    }
  };

  return (
    <>
      <Navbar currentStep={null} user={user} onSignOut={handleSignOut} points={balance} />
      <Page>
        <HeroCard>
          <div>
            <BalanceLabel>보유 포인트</BalanceLabel>
            <BalanceValue>
              {fmtNum(balance)}
              <Unit>P</Unit>
            </BalanceValue>
          </div>
          <Button variant="cta" size="lg" onClick={() => router.push('/')}>
            양식 만들러 가기
          </Button>
        </HeroCard>

        <SectionCard>
          <SectionTitle>포인트 충전</SectionTitle>
          <PresetRow>
            {PRESETS.map((v) => (
              <PresetButton
                key={v}
                $active={chargeAmount === v}
                onClick={() => setChargeAmount(v)}
              >
                {fmtNum(v)} P
              </PresetButton>
            ))}
          </PresetRow>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={handleCharge} disabled={busy}>
              {busy ? '결제창 여는 중…' : `${fmtNum(chargeAmount)}원 충전하기`}
            </Button>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              1원 = 1P · 테스트 결제입니다
            </span>
          </div>
          {error && (
            <div style={{ marginTop: 12, color: theme.colors.error, fontSize: 13 }}>
              {error}
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionTitle>다운로드 이력</SectionTitle>
          {history.length === 0 ? (
            <EmptyRow>아직 다운로드한 양식이 없습니다.</EmptyRow>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>일시</th>
                  <th>양식</th>
                  <th>버전</th>
                  <th>소모</th>
                  <th style={{ textAlign: 'right' }}>다시 받기</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const r = reportOf(row);
                  return (
                    <tr key={row.id}>
                      <td>{formatDate(row.created_at)}</td>
                      <td>{r?.label || r?.filename || '—'}</td>
                      <td>v{r?.version ?? '—'}</td>
                      <td>{fmtNum(row.points_spent)} P</td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => r?.id && handleRedownload(r.id)}
                          disabled={!r?.id}
                        >
                          다시 받기
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </SectionCard>
      </Page>
    </>
  );
}
