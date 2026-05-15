'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import Button from '@/components/common/Button';
import { PACKAGE_LIST, PACKAGES, type PackageCode } from '@/lib/passes-config';
import type { User } from '@supabase/supabase-js';

interface Props {
  open: boolean;
  user: User;
  tossClientKey: string;
  reportId?: string;
  onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
`;

const Modal = styled.div`
  background: #ffffff;
  border-radius: 12px;
  max-width: 720px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
`;

const Title = styled.h2`
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 800;
  color: ${theme.colors.textPrimary};
`;

const SubTitle = styled.p`
  margin: 0 0 18px;
  font-size: 13px;
  color: ${theme.colors.textSecondary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $featured?: boolean }>`
  border: 2px solid ${({ $featured }) => ($featured ? theme.colors.primary : theme.colors.cardBorder)};
  background: ${({ $featured }) => ($featured ? 'rgba(255,153,0,0.06)' : '#ffffff')};
  border-radius: 10px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
`;

const Tag = styled.span`
  position: absolute;
  top: -10px;
  right: 10px;
  background: ${theme.colors.primary};
  color: #1f0f00;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 10px;
`;

const Credits = styled.div`
  font-size: 20px;
  font-weight: 800;
`;

const Price = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const Meta = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  min-height: 32px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const ErrorMsg = styled.div`
  margin-top: 12px;
  color: ${theme.colors.error};
  font-size: 13px;
`;

function fmt(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function PurchaseDialog({ open, user, tossClientKey, reportId, onClose }: Props) {
  const [busy, setBusy] = useState<PackageCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

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
      const nextUrl = reportId
        ? `/?autoDownload=${encodeURIComponent(reportId)}`
        : '/point?purchased=1';
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: pkg.amount },
        orderId,
        orderName: pkg.orderName,
        successUrl: `${window.location.origin}/point/payment/success?packageCode=${pkg.code}&next=${encodeURIComponent(nextUrl)}`,
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

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>다운로드 이용권 구매</Title>
        <SubTitle>
          보유 이용권이 부족합니다. 다운로드 이용권 패키지를 선택해 구매해 주세요.
          {reportId && ' 결제 완료 후 자동으로 다운로드가 진행됩니다.'}
        </SubTitle>
        <Grid>
          {PACKAGE_LIST.map((pkg) => (
            <Card key={pkg.code} $featured={pkg.code === 'P15'}>
              {pkg.code === 'P15' && <Tag>추천</Tag>}
              <Credits>{pkg.credits}회 다운로드</Credits>
              <Price>{fmt(pkg.amount)}원</Price>
              <Meta>
                유효기간 1년<br />
                1회당 {Math.round(pkg.amount / pkg.credits)}원
              </Meta>
              <Button
                variant="primary"
                size="md"
                onClick={() => handlePurchase(pkg.code)}
                disabled={busy !== null}
              >
                {busy === pkg.code ? '결제창 여는 중…' : '구매하기'}
              </Button>
            </Card>
          ))}
        </Grid>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Footer>
          <span>유효기간 1년 · 미사용분 30일 내 환불</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            닫기
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
}
