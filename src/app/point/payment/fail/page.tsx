import Link from 'next/link';

interface SearchParams {
  message?: string;
  code?: string;
}

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { message, code } = await searchParams;

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '64px auto',
        padding: 24,
        textAlign: 'center',
        fontFamily: "'Amazon Ember', Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>결제에 실패했습니다</h1>
      {message && (
        <p style={{ color: '#CC0C39', marginBottom: 8 }}>{message}</p>
      )}
      {code && (
        <p style={{ color: '#565959', fontSize: 12 }}>코드: {code}</p>
      )}
      <div style={{ marginTop: 20 }}>
        <Link
          href="/point"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: 8,
            background: '#FFD814',
            color: '#0F1111',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          포인트 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
