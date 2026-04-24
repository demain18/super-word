// Toss Payments 공개 테스트 키 (회원가입 없이 사용 가능)
// 출처: https://github.com/tosspayments/tosspayments-sample, https://github.com/tosspayments/payment-samples
// 실서비스 전 개발자센터에서 발급받은 키로 반드시 교체할 것.
export const DEFAULT_TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
export const DEFAULT_TOSS_SECRET_KEY = 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export function getTossClientKey(): string {
  return process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || DEFAULT_TOSS_CLIENT_KEY;
}
