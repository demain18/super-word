import { ReportType, StyleType } from '@/types';
import { PERSONA, STYLE_PROMPTS } from './persona';

const REPORT_LABELS: Record<ReportType, string> = {
  'field-work': '외근 보고서',
  'business-trip': '출장 보고서',
  'meeting-minutes': '회의록',
  'weekly-monthly': '주간/월간 업무보고서',
  performance: '실적 보고서',
  quotation: '견적서',
  'service-contract': '용역 계약서',
};

export function buildStyleFeedbackPrompt(
  reportType: ReportType,
  style: StyleType,
  styleHistory: StyleType[],
  customFeedback?: string
): string {
  const cumulativeWeight = styleHistory.filter((s) => s === style).length;
  const intensityPercent = Math.min(15 + cumulativeWeight * 15, 90);

  let styleInstruction = STYLE_PROMPTS[style];
  if (customFeedback) {
    styleInstruction += `\n\n추가 사용자 피드백: ${customFeedback}`;
  }

  return `${PERSONA}

---

현재 "${REPORT_LABELS[reportType]}" 양식의 스타일을 조정합니다.
스타일 적용 강도: ${intensityPercent}%

${styleInstruction}

위 스타일 방향에 맞게 어떤 변경을 적용했는지 한국어로 간단히 설명해주세요 (3문장 이내).`;
}

export function buildCustomFeedbackPrompt(
  reportType: ReportType,
  customFeedback: string,
  currentStyle?: StyleType | null
): string {
  return `${PERSONA}

---

현재 "${REPORT_LABELS[reportType]}" 양식을 사용자의 피드백에 따라 수정합니다.
${currentStyle ? `현재 적용된 스타일: ${STYLE_PROMPTS[currentStyle]}` : ''}

사용자 피드백: ${customFeedback}

사용자의 피드백을 반영하여 보고서 양식을 재구성해주세요.

반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 다른 텍스트는 포함하지 마세요.

{
  "title": "보고서 제목",
  "info": [
    ["항목명", "값 (플레이스홀더)"],
    ["항목명", "값 (플레이스홀더)"]
  ],
  "sections": [
    {
      "heading": "섹션 제목",
      "paragraphs": ["[플레이스홀더 안내 텍스트]"]
    },
    {
      "heading": "섹션 제목",
      "table": {
        "headers": ["열1", "열2", "열3"],
        "rows": [["[값]", "[값]", "[값]"]]
      }
    }
  ],
  "message": "사용자에게 어떤 수정을 했는지 설명하는 메시지"
}

규칙:
- 이것은 아직 빈 양식이므로 내용은 [플레이스홀더] 형태로 작성
- 사용자의 피드백을 정확히 반영
- 한국 기업 보고서 문화에 맞게 구성
- message 필드에 어떤 수정을 적용했는지 안내`;
}

export function buildStyleFromPrompt(userPrompt: string): string {
  return `너는 한국어 문서 디자이너다. 사용자의 스타일 요청을 문서 서식 사양(JSON)으로 변환한다.

사용자 요청:
${userPrompt}

요청의 분위기·대상·색감·폰트 느낌을 반영해 아래 JSON으로만 응답하라. JSON 외의 다른 텍스트는 포함하지 마라.

{
  "font": "문서에 쓸 폰트 이름. 둥근/귀여운 느낌이면 '나눔스퀘어라운드'·'나눔손글씨', 격식이면 '맑은 고딕'·'바탕'",
  "titlePt": 제목 크기(pt, 18~32),
  "headingPt": 소제목 크기(pt, 13~20),
  "bodyPt": 본문 크기(pt, 10~13),
  "titleColor": "#RRGGBB",
  "headingColor": "#RRGGBB",
  "accentColor": "#RRGGBB",
  "borderColor": "#RRGGBB",
  "headerBgColor": "#RRGGBB",
  "message": "어떤 스타일을 적용했는지 한 줄 설명"
}

규칙:
- 요청한 색감을 적극 반영(예: "노랑/유치원" → 밝은 노랑·주황 계열, headerBgColor는 아주 연한 톤)
- 가독성 유지(본문 글자색이 너무 흐리지 않게)
- 둥근/유치원/팜플렛 느낌이면 폰트도 그에 맞게 선택`;
}

export function buildCustomFormPrompt(userPrompt: string): string {
  return `${PERSONA}

---

사용자가 직접 설명한 "맞춤 문서 양식"을 새로 설계합니다.

사용자 요청:
${userPrompt}

요청에 맞는 한국 비즈니스 문서 양식의 구조를 설계해주세요. 아직 빈 양식이므로 실제 값 대신 [플레이스홀더]로 채웁니다.

반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 다른 텍스트는 포함하지 마세요.

{
  "title": "문서 제목",
  "info": [
    ["항목명", "[값 플레이스홀더]"]
  ],
  "sections": [
    { "heading": "섹션 제목", "paragraphs": ["[안내/플레이스홀더 텍스트]"] },
    { "heading": "섹션 제목", "table": { "headers": ["열1", "열2"], "rows": [["[값]", "[값]"]] } }
  ],
  "message": "어떤 양식을 만들었는지 한 줄 설명"
}

규칙:
- info에는 작성일자·작성자 등 머리 정보 항목을 [플레이스홀더]로 구성
- 본문 내용은 모두 [플레이스홀더] 형태로(실제 값 넣지 말 것)
- 표가 어울리는 섹션은 table, 서술이 어울리면 paragraphs 사용
- 한국 기업 문서 문화에 맞게 자연스럽게 구성`;
}

export function buildCustomEditPrompt(currentContentJson: string, instruction: string): string {
  return `${PERSONA}

---

아래는 현재 맞춤 문서 양식의 구조(JSON)입니다.

${currentContentJson}

사용자 지시:
${instruction}

지시에 따라 위 구조를 수정하세요. 전체 구조는 유지하되 지시된 부분(내용 채우기 또는 구조 변경)을 반영합니다.

반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 다른 텍스트는 포함하지 마세요.

{
  "title": "문서 제목",
  "info": [["항목명", "값"]],
  "sections": [
    { "heading": "섹션 제목", "paragraphs": ["..."] },
    { "heading": "섹션 제목", "table": { "headers": ["열1"], "rows": [["값"]] } }
  ],
  "message": "사용자에게 보여줄 응답 메시지"
}

규칙:
- 사용자가 정보를 제공하면 해당 [플레이스홀더]를 실제 값으로 채움
- 사용자가 구조 변경을 요청하면 섹션/표를 조정
- 제공되지 않은 항목은 기존 [플레이스홀더] 유지
- message에 무엇을 했는지 간단히 안내`;
}

export function buildContentFillPrompt(
  reportType: ReportType,
  placeholders: string[],
  userInput: string
): string {
  return `${PERSONA}

---

현재 "${REPORT_LABELS[reportType]}" 양식의 빈 칸을 채워넣어야 합니다.

양식에 있는 플레이스홀더(빈 칸) 목록:
${placeholders.map((p, i) => `${i + 1}. ${p}`).join('\n')}

사용자가 제공한 정보:
${userInput}

위 정보를 기반으로 각 플레이스홀더에 들어갈 실제 내용을 작성해주세요.

반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 다른 텍스트는 포함하지 마세요.

{
  "title": "이 보고서를 식별할 짧은 제목 (12자 이내, 예: '3월 강남지점 외근')",
  "replacements": {
    "[플레이스홀더 원본 텍스트]": "실제 채워넣을 내용",
    "[플레이스홀더 원본 텍스트]": "실제 채워넣을 내용"
  },
  "message": "사용자에게 보여줄 응답 메시지"
}

규칙:
- title: 최근 프로젝트 목록용 짧고 구체적인 이름(날짜·장소·주제 등)
- replacements 키는 위 플레이스홀더를 대괄호 포함 정확히 그대로 사용
- 모든 플레이스홀더에 값 제공. 없는 정보는 합리적으로 추론하되 [확인 필요] 표시`;
}
