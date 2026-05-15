'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/common/Button';
import { createClient } from '@/lib/supabase/client';
import { PACKAGE_LIST, PACKAGES, type PackageCode } from '@/lib/passes-config';
import type { User } from '@supabase/supabase-js';
import type { PassRow, DownloadHistoryRow } from '@/lib/passes';

interface Props {
  user: User;
  initialTotalCredits: number;
  initialPasses: PassRow[];
  initialHistory: DownloadHistoryRow[];
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

const HeroLabel = styled.div`
  font-size: 13px;
  opacity: 0.75;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
`;

const HeroValue = styled.div`
  font-size: 38px;
  font-weight: 800;
  color: ${theme.colors.primary};
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const HeroUnit = styled.span`
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

const PackageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const PackageCard = styled.div<{ $featured?: boolean }>`
  border: 2px solid ${({ $featured }) => ($featured ? theme.colors.primary : theme.colors.cardBorder)};
  background: ${({ $featured }) => ($featured ? 'rgba(255,153,0,0.06)' : '#ffffff')};
  border-radius: 10px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;

const PackageBadge = styled.span`
  position: absolute;
  top: -10px;
  right: 12px;
  background: ${theme.colors.primary};
  color: #1f0f00;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 10px;
`;

const PackageCredits = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: ${theme.colors.textPrimary};
`;

const PackagePrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const PackageMeta = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  min-height: 32px;
`;

const PassList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PassItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
`;

const PassMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PassRemainingTxt = styled.span`
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const PassExpiry = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: 12px;
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

const NoticeBox = styled.div`
  background: #f7f8fa;
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 12px;
  line-height: 1.7;
  color: ${theme.colors.textSecondary};
`;

const NoticeTitle = styled.div`
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin-bottom: 6px;
  font-size: 13px;
`;

const NoticeLinks = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 12px;

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
  }
`;

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function formatDateTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

function formatDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function fmtNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function packageLabel(code: string): string {
  if (code === 'LEGACY') return '레거시 이용권';
  if (code === 'P5' || code === 'P15' || code === 'P30') {
    return PACKAGES[code].label;
  }
  return code;
}

function reportOf(row: DownloadHistoryRow) {
  const r = row.report;
  if (Array.isArray(r)) return r[0] ?? null;
  return r;
}

export default function PointClient({
  user,
  initialTotalCredits,
  initialPasses,
  initialHistory,
  tossClientKey,
}: Props) {
  const router = useRouter();
  const [totalCredits, setTotalCredits] = useState(initialTotalCredits);
  const [passes, setPasses] = useState<PassRow[]>(initialPasses);
  const [history, setHistory] = useState<DownloadHistoryRow[]>(initialHistory);
  const [busy, setBusy] = useState<PackageCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/passes');
    if (res.ok) {
      const data = await res.json();
      setTotalCredits(data.totalCredits);
      setPasses(data.passes);
      setHistory(data.history);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handlePurchase = async (code: PackageCode) => {
    if (busy) return;
    setError(null);
    setBusy(code);
    const pkg = PACKAGES[code];
    try {
      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
      const tossPayments = await loadTossPayments(tossClientKey);
      const payment = tossPayments.payment({ customerKey: user.id });
      const orderId = (crypto?.randomUUID?.() ??
        `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: pkg.amount },
        orderId,
        orderName: pkg.orderName,
        successUrl: `${window.location.origin}/point/payment/success?packageCode=${pkg.code}`,
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
      setBusy(null);
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

  const activePasses = passes
    .filter((p) => p.status === 'active' && p.creditsRemaining > 0 && new Date(p.expiresAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

  return (
    <>
      <Navbar currentStep={null} user={user} onSignOut={handleSignOut} credits={totalCredits} />
      <Page>
        <HeroCard>
          <div>
            <HeroLabel>보유 이용권</HeroLabel>
            <HeroValue>
              {fmtNum(totalCredits)}
              <HeroUnit>회</HeroUnit>
            </HeroValue>
          </div>
          <Button variant="cta" size="lg" onClick={() => router.push('/')}>
            양식 만들러 가기
          </Button>
        </HeroCard>

        <SectionCard>
          <SectionTitle>이용권 구매</SectionTitle>
          <PackageGrid>
            {PACKAGE_LIST.map((pkg) => (
              <PackageCard key={pkg.code} $featured={pkg.code === 'P15'}>
                {pkg.code === 'P15' && <PackageBadge>추천</PackageBadge>}
                <PackageCredits>{pkg.credits}회 다운로드</PackageCredits>
                <PackagePrice>{fmtNum(pkg.amount)}원</PackagePrice>
                <PackageMeta>
                  유효기간 1년<br />
                  1회당 {Math.round(pkg.amount / pkg.credits)}원
                </PackageMeta>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handlePurchase(pkg.code)}
                  disabled={busy !== null}
                >
                  {busy === pkg.code ? '결제창 여는 중…' : '구매하기'}
                </Button>
              </PackageCard>
            ))}
          </PackageGrid>
          {error && (
            <div style={{ marginTop: 12, color: theme.colors.error, fontSize: 13 }}>
              {error}
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <SectionTitle>활성 이용권</SectionTitle>
          {activePasses.length === 0 ? (
            <EmptyRow>보유 중인 이용권이 없습니다.</EmptyRow>
          ) : (
            <PassList>
              {activePasses.map((p) => (
                <PassItem key={p.id}>
                  <PassMeta>
                    <PassRemainingTxt>
                      {packageLabel(p.packageCode)} · {p.creditsRemaining}/{p.creditsTotal}회 남음
                    </PassRemainingTxt>
                    <PassExpiry>만료일 {formatDate(p.expiresAt)}</PassExpiry>
                  </PassMeta>
                </PassItem>
              ))}
            </PassList>
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
                  <th>사용</th>
                  <th style={{ textAlign: 'right' }}>다시 받기</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const r = reportOf(row);
                  return (
                    <tr key={row.id}>
                      <td>{formatDateTime(row.created_at)}</td>
                      <td>{r?.label || r?.filename || '—'}</td>
                      <td>v{r?.version ?? '—'}</td>
                      <td>{row.credits_used}회</td>
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

        <NoticeBox>
          <NoticeTitle>이용 안내</NoticeTitle>
          • 이용권은 발급일로부터 1년간 유효하며, 유효기간 경과 시 자동 소멸됩니다.<br />
          • 양식 1회 다운로드 시 1회가 차감되며, 동일 양식의 재다운로드는 차감되지 않습니다.<br />
          • 미사용 잔여 회수에 한해, 발급일로부터 30일 이내 이메일(pummacreative@gmail.com)로 환불 신청이 가능합니다.<br />
          • 보유 회수가 부족할 경우 다운로드 시점에 이용권 구매 안내가 표시됩니다.
          <NoticeLinks>
            <Link href="/terms">이용약관</Link>
            <Link href="/refund">환불 정책</Link>
          </NoticeLinks>
        </NoticeBox>
      </Page>
    </>
  );
}
