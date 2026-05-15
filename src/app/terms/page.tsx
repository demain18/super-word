import Link from 'next/link';

export const metadata = {
  title: '이용약관 | Super Word',
};

export default function TermsPage() {
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
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>이용약관</h1>
      <p style={{ color: '#565959', fontSize: 13, marginBottom: 28 }}>
        시행일: 2026년 5월 14일
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>제1조 (목적)</h2>
        <p>
          본 약관은 품어크리에이티브(이하 &ldquo;회사&rdquo;)가 운영하는 Super Word(이하 &ldquo;서비스&rdquo;)의
          이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>제2조 (서비스의 정의)</h2>
        <p>
          서비스는 회원이 입력한 정보를 기반으로 Microsoft Word 형식의 업무용 문서 양식을 생성·다운로드할 수
          있도록 지원하는 SaaS 형태의 유료 서비스입니다.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>제3조 (이용권 및 결제)</h2>
        <ol style={{ paddingLeft: 18 }}>
          <li>
            회사는 다음의 다운로드 이용권 패키지를 판매합니다.
            <ul style={{ paddingLeft: 18, marginTop: 6 }}>
              <li>5회 다운로드 이용권: 1,000원</li>
              <li>15회 다운로드 이용권: 3,000원</li>
              <li>30회 다운로드 이용권: 5,000원</li>
            </ul>
          </li>
          <li style={{ marginTop: 6 }}>
            이용권은 발급일로부터 <strong>1년</strong>간 유효하며, 유효기간 경과 시 잔여 회수는 자동 소멸됩니다.
          </li>
          <li style={{ marginTop: 6 }}>
            문서 1회 다운로드 시 보유 이용권에서 1회가 차감되며, 동일 문서의 재다운로드는 차감되지 않습니다.
          </li>
          <li style={{ marginTop: 6 }}>
            결제는 토스페이먼츠를 통해 진행되며, 신용/체크카드 결제만 지원합니다(정기결제 미제공).
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>제4조 (환불)</h2>
        <p>
          환불은 별도의 <Link href="/refund" style={{ color: '#E47911', fontWeight: 600 }}>환불 정책</Link>
          에 따릅니다. 미사용 회수에 한해 발급일로부터 30일 이내 이메일로 환불 신청이 가능합니다.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>제5조 (회원의 의무)</h2>
        <ul style={{ paddingLeft: 18 }}>
          <li>회원은 본인의 계정 정보를 안전하게 관리할 책임이 있습니다.</li>
          <li>회원은 서비스를 통해 생성된 문서를 적법한 범위 내에서 사용하여야 합니다.</li>
          <li>회원은 타인의 권리를 침해하거나 법령을 위반하는 용도로 서비스를 이용할 수 없습니다.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>제6조 (회사의 면책)</h2>
        <p>
          서비스는 알파 테스트 단계로, 회사는 서비스의 일시적 중단 또는 데이터 손실 등에 대해 회원이 입은 손해가
          회사의 고의 또는 중과실에 기인하지 않는 한 책임을 지지 않습니다.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>제7조 (문의)</h2>
        <p>
          서비스 이용과 관련한 문의는 <strong>pummacreative@gmail.com</strong>으로 연락 주시기 바랍니다.
        </p>
      </section>

      <p style={{ marginTop: 36, fontSize: 12, color: '#999' }}>
        본 약관은 서비스 운영상의 필요에 따라 변경될 수 있으며, 변경 시 본 페이지를 통해 사전 고지합니다.
      </p>
    </main>
  );
}
