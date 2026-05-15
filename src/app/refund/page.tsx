import Link from 'next/link';

export const metadata = {
  title: '환불 정책 | Super Word',
};

export default function RefundPage() {
  return (
    <main
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: '32px 20px 64px',
        fontFamily: "'Amazon Ember', Arial, sans-serif",
        color: '#0F1111',
        lineHeight: 1.7,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <Link href="/" style={{ color: '#565959', fontSize: 13 }}>
          ← 홈으로
        </Link>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>환불 정책</h1>
      <p style={{ color: '#565959', fontSize: 13, marginBottom: 28 }}>
        시행일: 2026년 5월 14일
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>1. 환불 대상</h2>
        <ul style={{ paddingLeft: 18 }}>
          <li>구매한 다운로드 이용권 중 <strong>미사용 잔여 회수</strong>가 있는 경우.</li>
          <li>이미 사용한 회수는 환불 대상에서 제외됩니다.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>2. 환불 가능 기간</h2>
        <p>
          이용권 발급일(결제 완료일)로부터 <strong>30일 이내</strong>에 한해 환불 신청이 가능합니다.
          30일이 경과한 이용권 및 유효기간(1년)이 경과해 자동 소멸된 이용권은 환불 대상에서 제외됩니다.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>3. 환불 금액 산정</h2>
        <ul style={{ paddingLeft: 18 }}>
          <li>환불 금액 = 패키지 결제 금액 × (미사용 회수 ÷ 전체 회수)</li>
          <li>
            예시) 15회 이용권(3,000원) 중 5회 사용 후 환불 신청 시,
            <br />
            3,000원 × (10 ÷ 15) = <strong>2,000원</strong> 환불.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>4. 환불 신청 방법</h2>
        <ol style={{ paddingLeft: 18 }}>
          <li>
            <strong>pummacreative@gmail.com</strong> 으로 다음 정보를 포함해 환불 신청 이메일을 보내주세요.
            <ul style={{ paddingLeft: 18, marginTop: 6 }}>
              <li>가입 시 사용한 Google 계정 이메일</li>
              <li>환불을 원하는 이용권의 결제일</li>
              <li>환불 사유 (선택)</li>
            </ul>
          </li>
          <li style={{ marginTop: 6 }}>
            접수 후 영업일 기준 3일 이내 환불 가능 여부를 회신드리며, 처리 완료까지 최대 7영업일이 소요될 수
            있습니다.
          </li>
          <li style={{ marginTop: 6 }}>
            환불은 결제하신 카드로 취소 처리되며, 카드사 사정에 따라 환급까지 추가 일수가 소요될 수 있습니다.
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>5. 환불 제한 사항</h2>
        <ul style={{ paddingLeft: 18 }}>
          <li>전체 회수를 모두 사용한 이용권</li>
          <li>발급일로부터 30일이 경과한 이용권</li>
          <li>유효기간 1년이 경과해 자동 소멸된 이용권</li>
          <li>부정한 방법으로 취득한 이용권</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>6. 문의</h2>
        <p>
          환불 관련 문의는 <strong>pummacreative@gmail.com</strong>으로 연락 주시기 바랍니다.
          <br />
          관련 약관은 <Link href="/terms" style={{ color: '#E47911', fontWeight: 600 }}>이용약관</Link>
          에서 확인하실 수 있습니다.
        </p>
      </section>
    </main>
  );
}
