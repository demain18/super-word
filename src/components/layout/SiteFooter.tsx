import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/company-info';

/**
 * 사업자정보 + 정책 링크 푸터.
 *
 * 결제대행사/카드사 심사 요건상 메인·결제 페이지 등에 사업자정보가 상시 노출되어야 한다.
 * 훅/emotion을 쓰지 않아 서버 컴포넌트(약관·환불·개인정보)와 클라이언트 컴포넌트(결제 페이지)
 * 양쪽에서 그대로 사용할 수 있다.
 */
const wrap: React.CSSProperties = {
  borderTop: '1px solid #D5D9D9',
  background: '#F7F8F8',
  color: '#565959',
  fontSize: 12,
  lineHeight: 1.8,
  fontFamily: "'Amazon Ember', Arial, sans-serif",
};

const inner: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '24px 20px 32px',
};

const linkRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  marginBottom: 14,
};

const linkStyle: React.CSSProperties = {
  color: '#0F1111',
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: 13,
};

const bizGrid: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  rowGap: 2,
  columnGap: 14,
};

const item = (label: string, value: string) => (
  <span>
    <span style={{ color: '#888' }}>{label}</span>{' '}
    <span>{value}</span>
  </span>
);

export default function SiteFooter() {
  return (
    <footer style={wrap}>
      <div style={inner}>
        <div style={linkRow}>
          <Link href="/terms" style={linkStyle}>이용약관</Link>
          <Link href="/privacy" style={linkStyle}>개인정보처리방침</Link>
          <Link href="/refund" style={linkStyle}>환불 정책</Link>
        </div>

        <div style={{ fontWeight: 700, color: '#0F1111', marginBottom: 4 }}>
          {COMPANY_INFO.name}
        </div>
        <div style={bizGrid}>
          {item('대표자', COMPANY_INFO.ceo)}
          {item('사업자등록번호', COMPANY_INFO.bizRegNo)}
          {item('통신판매업신고번호', COMPANY_INFO.mailOrderNo)}
        </div>
        <div style={bizGrid}>
          {item('주소', COMPANY_INFO.address)}
        </div>
        <div style={bizGrid}>
          {item('전화', COMPANY_INFO.phone)}
          {item('이메일', COMPANY_INFO.email)}
        </div>

        <div style={{ marginTop: 14, color: '#999' }}>
          © {COMPANY_INFO.name}. 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
        </div>
      </div>
    </footer>
  );
}
