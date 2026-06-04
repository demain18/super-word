import Link from 'next/link';
import SiteFooter from '@/components/layout/SiteFooter';
import { COMPANY_INFO } from '@/lib/company-info';

export const metadata = {
  title: '개인정보처리방침 | Super Word',
};

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 8 };
const section: React.CSSProperties = { marginBottom: 24 };

export default function PrivacyPage() {
  return (
    <>
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
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>개인정보처리방침</h1>
        <p style={{ color: '#565959', fontSize: 13, marginBottom: 28 }}>시행일: 2026년 5월 14일</p>

        <section style={section}>
          <p>
            {COMPANY_INFO.name}(이하 &ldquo;회사&rdquo;)는 {COMPANY_INFO.serviceName}(이하 &ldquo;서비스&rdquo;) 이용자의
            개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 회사가 어떤
            개인정보를 어떤 목적으로 수집·이용하며, 어떻게 보관·파기하는지를 안내합니다.
          </p>
        </section>

        <section style={section}>
          <h2 style={h2}>1. 수집하는 개인정보 항목</h2>
          <ul style={{ paddingLeft: 18 }}>
            <li>
              <strong>회원 가입·로그인(Google 소셜 로그인):</strong> 이메일 주소, 이름, 프로필 사진, 소셜 계정
              고유 식별자
            </li>
            <li>
              <strong>결제 시:</strong> 결제 승인 정보(주문번호, 결제수단, 결제금액, 결제 결과). 카드번호 등
              민감한 결제 인증정보는 결제대행사(토스페이먼츠)가 처리하며 회사는 보관하지 않습니다.
            </li>
            <li>
              <strong>서비스 이용 시:</strong> 이용자가 문서 생성을 위해 입력한 내용, 생성·다운로드한 문서 및
              이력, 이용권 보유·차감 내역
            </li>
            <li>
              <strong>자동 수집:</strong> 접속 로그, 쿠키, 기기·브라우저 정보(서비스 제공 및 부정 이용 방지 목적)
            </li>
          </ul>
        </section>

        <section style={section}>
          <h2 style={h2}>2. 개인정보의 수집·이용 목적</h2>
          <ul style={{ paddingLeft: 18 }}>
            <li>회원 식별 및 로그인, 본인 확인</li>
            <li>문서 생성·다운로드 등 서비스 제공 및 이용권 관리</li>
            <li>결제 처리, 환불 및 청구 관련 업무</li>
            <li>고객 문의 응대 및 분쟁 처리</li>
            <li>부정 이용 방지 및 서비스 개선</li>
          </ul>
        </section>

        <section style={section}>
          <h2 style={h2}>3. 보유 및 이용 기간</h2>
          <ul style={{ paddingLeft: 18 }}>
            <li>회원 정보: 회원 탈퇴 시 지체 없이 파기. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</li>
            <li>전자상거래법에 따른 보존:
              <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              </ul>
            </li>
          </ul>
        </section>

        <section style={section}>
          <h2 style={h2}>4. 개인정보의 제3자 제공</h2>
          <p>
            회사는 이용자의 개인정보를 본 방침에서 고지한 범위를 넘어 제3자에게 제공하지 않습니다. 다만 결제
            처리를 위해 결제대행사에 결제에 필요한 정보가 제공되며, 법령에 근거하거나 수사기관의 적법한 요청이
            있는 경우 예외로 합니다.
          </p>
        </section>

        <section style={section}>
          <h2 style={h2}>5. 개인정보 처리의 위탁</h2>
          <p>회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
          <ul style={{ paddingLeft: 18, marginTop: 6 }}>
            <li><strong>토스페이먼츠(주):</strong> 결제 처리 및 결제 도용 방지</li>
            <li><strong>Supabase Inc.:</strong> 회원 인증 및 데이터 보관(클라우드 인프라)</li>
            <li><strong>Google LLC:</strong> 소셜 로그인(인증) 처리</li>
          </ul>
        </section>

        <section style={section}>
          <h2 style={h2}>6. 정보주체의 권리와 행사 방법</h2>
          <p>
            이용자는 언제든지 본인의 개인정보에 대한 열람·정정·삭제·처리정지를 요청할 수 있으며, 회원 탈퇴를
            통해 개인정보 수집·이용 동의를 철회할 수 있습니다. 요청은 아래 문의처로 접수해 주시면 지체 없이
            조치합니다.
          </p>
        </section>

        <section style={section}>
          <h2 style={h2}>7. 개인정보의 파기</h2>
          <p>
            개인정보는 보유기간이 경과하거나 처리 목적이 달성되면 지체 없이 파기합니다. 전자적 파일은 복구가
            불가능한 방법으로 영구 삭제하며, 출력물 등은 분쇄 또는 소각합니다.
          </p>
        </section>

        <section style={section}>
          <h2 style={h2}>8. 개인정보 보호책임자</h2>
          <ul style={{ paddingLeft: 18 }}>
            <li>성명: {COMPANY_INFO.ceo}</li>
            <li>상호: {COMPANY_INFO.name}</li>
            <li>이메일: {COMPANY_INFO.email}</li>
            <li>전화: {COMPANY_INFO.phone}</li>
          </ul>
        </section>

        <p style={{ marginTop: 36, fontSize: 12, color: '#999' }}>
          본 방침은 법령·서비스 변경에 따라 수정될 수 있으며, 변경 시 본 페이지를 통해 사전 고지합니다.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
