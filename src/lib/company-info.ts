/**
 * 사업자 정보 — 단일 소스(single source of truth).
 *
 * 전자상거래법 제13조 및 결제대행사(PG)/카드사 입점 심사 표시의무 대응용.
 * 메인 nav 드롭다운(SiteFooter / Navbar)·약관·개인정보처리방침·환불·결제 페이지에서 공통 참조한다.
 *
 * TODO(사업자 — 신고/개통 후 실제 값으로 교체):
 *  - mailOrderNo: 통신판매업 신고 완료 후 신고번호로 교체. (구매안전확인증은 PG사에 요청해 발급)
 *  - phone: 반드시 "유선 전화번호"로 교체. 카드사 심사상 휴대폰번호는 불가.
 */
export const COMPANY_INFO = {
  serviceName: 'Super Word',
  /** 상호명 */
  name: '품어크리에이티브',
  /** 대표자명 */
  ceo: '김명준',
  /** 사업자등록번호 */
  bizRegNo: '475-25-01977',
  /** 통신판매업 신고번호 — TODO: 신고 후 교체 */
  mailOrderNo: 'XXX-XXX',
  /** 사업장 주소지 */
  address: '서울특별시 강서구 강서로18마길 24-9, 301호(화곡동, 호성탑스빌)',
  /** 고객센터 전화 — TODO: 유선 전화번호로 교체(휴대폰 불가) */
  phone: '000-0000-0000',
  /** 고객센터 이메일 */
  email: 'pummacreative@gmail.com',
} as const;
