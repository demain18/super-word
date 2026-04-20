import { ReportType, StyleType } from '@/types';
import { PERSONA, STYLE_PROMPTS } from './persona';

const REPORT_LABELS: Record<ReportType, string> = {
  'field-work': '외근 보고서',
  'business-trip': '출장 보고서',
  'meeting-minutes': '회의록',
  'weekly-monthly': '주간/월간 업무보고서',
  performance: '실적 보고서',
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
  "replacements": {
    "[플레이스홀더 원본 텍스트]": "실제 채워넣을 내용",
    "[플레이스홀더 원본 텍스트]": "실제 채워넣을 내용"
  },
  "message": "사용자에게 보여줄 응답 메시지"
}

규칙:
- replacements의 키는 위 플레이스홀더 목록의 텍스트를 대괄호 포함하여 정확히 그대로 사용
- 자연스럽고 사무적인 어투로 작성 (실제 직장인이 작성한 것처럼)
- 과도한 미사여구 금지, 간결하고 명확하게
- 사용자가 제공하지 않은 정보는 합리적으로 추론하되 [확인 필요] 표시 추가
- 모든 플레이스홀더에 대해 값을 제공할 것 (정보가 없으면 원본 유지하지 말고 적절한 예시를 넣되 [확인 필요] 표시)
- message 필드에는 어떤 내용을 채웠는지 간략히 안내`;
}
