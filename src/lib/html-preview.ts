import { ReportType, StyleType } from '@/types';
import { AIDocumentContent } from './docx-builder';

interface StyleSettings {
  font: string;
  titleSize: string;
  headingSize: string;
  bodySize: string;
  titleColor: string;
  headingColor: string;
  accentColor: string;
  borderColor: string;
  headerBgColor: string;
}

const STYLE_MAP: Record<StyleType | 'default', StyleSettings> = {
  default: {
    font: "'Malgun Gothic', '맑은 고딕', sans-serif",
    titleSize: '22px',
    headingSize: '16px',
    bodySize: '13px',
    titleColor: '#000000',
    headingColor: '#333333',
    accentColor: '#4472C4',
    borderColor: '#999999',
    headerBgColor: '#E7E6E6',
  },
  corporate: {
    font: "'Malgun Gothic', '맑은 고딕', sans-serif",
    titleSize: '24px',
    headingSize: '17px',
    bodySize: '13px',
    titleColor: '#1F3864',
    headingColor: '#1F3864',
    accentColor: '#1F3864',
    borderColor: '#1F3864',
    headerBgColor: '#D6DCE4',
  },
  'global-startup': {
    font: "'Malgun Gothic', '맑은 고딕', sans-serif",
    titleSize: '24px',
    headingSize: '17px',
    bodySize: '13px',
    titleColor: '#2D2D2D',
    headingColor: '#0066FF',
    accentColor: '#0066FF',
    borderColor: '#CCCCCC',
    headerBgColor: '#F0F4FF',
  },
  government: {
    font: "'Batang', '바탕', serif",
    titleSize: '22px',
    headingSize: '16px',
    bodySize: '13px',
    titleColor: '#000000',
    headingColor: '#000000',
    accentColor: '#000000',
    borderColor: '#000000',
    headerBgColor: '#F2F2F2',
  },
};

function getStyle(styleType?: StyleType | null): StyleSettings {
  if (!styleType) return STYLE_MAP.default;
  return STYLE_MAP[styleType];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function approvalTableHtml(s: StyleSettings): string {
  return `<table style="width:45%;margin-left:auto;border-collapse:collapse;margin-bottom:20px;">
    <tr>
      ${['구분', '작성자', '검토자', '승인자']
        .map(
          (h) =>
            `<td style="border:1px solid ${s.borderColor};padding:6px 8px;text-align:center;font-weight:bold;font-size:11px;background:${s.headerBgColor};">${h}</td>`
        )
        .join('')}
    </tr>
    <tr>
      ${['성명', '', '', '']
        .map(
          (v) =>
            `<td style="border:1px solid ${s.borderColor};padding:6px 8px;text-align:center;font-size:11px;height:28px;">${v}</td>`
        )
        .join('')}
    </tr>
    <tr>
      ${['서명', '', '', '']
        .map(
          (v) =>
            `<td style="border:1px solid ${s.borderColor};padding:6px 8px;text-align:center;font-size:11px;height:40px;">${v}</td>`
        )
        .join('')}
    </tr>
  </table>`;
}

function infoTableHtml(rows: string[][], s: StyleSettings): string {
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    ${rows
      .map(
        (row) => `<tr>
        <td style="border:1px solid ${s.borderColor};padding:8px 12px;text-align:center;font-weight:bold;font-size:${s.bodySize};background:${s.headerBgColor};width:25%;">${escapeHtml(row[0])}</td>
        <td style="border:1px solid ${s.borderColor};padding:8px 12px;font-size:${s.bodySize};width:75%;">${escapeHtml(row[1])}</td>
      </tr>`
      )
      .join('')}
  </table>`;
}

function dataTableHtml(
  headers: string[] | undefined,
  rows: string[][],
  s: StyleSettings
): string {
  let html = `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">`;
  if (headers) {
    html += `<tr>${headers
      .map(
        (h) =>
          `<th style="border:1px solid ${s.borderColor};padding:8px;text-align:center;font-size:${s.bodySize};font-weight:bold;background:${s.headerBgColor};">${escapeHtml(h)}</th>`
      )
      .join('')}</tr>`;
  }
  for (const row of rows) {
    html += `<tr>${row
      .map(
        (cell) =>
          `<td style="border:1px solid ${s.borderColor};padding:8px;font-size:${s.bodySize};">${escapeHtml(cell)}</td>`
      )
      .join('')}</tr>`;
  }
  html += `</table>`;
  return html;
}

interface TemplateSection {
  type?: string;
  heading?: string;
  content?: string;
  table?: { headers?: string[]; rows: string[][] };
}

const REPORT_TEMPLATES: Record<ReportType, { title: string; sections: TemplateSection[] }> = {
  'field-work': {
    title: '외근 보고서',
    sections: [
      { type: 'approval' },
      {
        type: 'info',
        table: {
          rows: [
            ['작성일자', '[작성일자를 입력하세요]'],
            ['작성자', '[이름 / 부서 / 직급]'],
            ['외근 일시', '[외근 날짜 및 시간]'],
            ['외근 장소', '[방문 장소]'],
            ['외근 목적', '[외근 목적을 입력하세요]'],
          ],
        },
      },
      { heading: '1. 외근 개요', content: '[외근의 전반적인 목적과 배경을 서술하세요]' },
      { heading: '2. 방문 내용', content: '[방문 대상, 미팅 내용, 논의 사항 등을 상세히 기술하세요]' },
      { heading: '3. 주요 성과 및 결과', content: '[외근을 통해 달성한 성과나 합의 사항을 정리하세요]' },
      {
        heading: '4. 후속 조치 사항',
        table: {
          headers: ['번호', '후속 조치 내용', '담당자', '완료 예정일'],
          rows: [
            ['1', '[후속 조치 내용]', '[담당자]', '[예정일]'],
            ['2', '[후속 조치 내용]', '[담당자]', '[예정일]'],
          ],
        },
      },
      { heading: '5. 기타 참고사항', content: '[추가 참고사항이 있으면 기술하세요]' },
    ],
  },
  'business-trip': {
    title: '출장 보고서',
    sections: [
      { type: 'approval' },
      {
        type: 'info',
        table: {
          rows: [
            ['작성일자', '[작성일자를 입력하세요]'],
            ['작성자', '[이름 / 부서 / 직급]'],
            ['출장 기간', '[출장 시작일 ~ 종료일]'],
            ['출장지', '[출장 장소]'],
            ['출장 목적', '[출장 목적을 입력하세요]'],
          ],
        },
      },
      { heading: '1. 출장 개요', content: '[출장의 배경 및 목적을 서술하세요]' },
      {
        heading: '2. 일정별 활동 내역',
        table: {
          headers: ['일자', '시간', '활동 내용', '장소', '비고'],
          rows: [
            ['[날짜]', '[시간]', '[활동 내용]', '[장소]', ''],
            ['[날짜]', '[시간]', '[활동 내용]', '[장소]', ''],
          ],
        },
      },
      { heading: '3. 주요 성과', content: '[출장을 통해 달성한 성과를 정리하세요]' },
      {
        heading: '4. 경비 내역',
        table: {
          headers: ['항목', '금액', '비고'],
          rows: [
            ['교통비', '[금액]', ''],
            ['숙박비', '[금액]', ''],
            ['식비', '[금액]', ''],
            ['기타', '[금액]', ''],
            ['합계', '[총 금액]', ''],
          ],
        },
      },
      { heading: '5. 후속 조치 및 건의사항', content: '[후속 조치 사항 및 건의사항을 기술하세요]' },
    ],
  },
  'meeting-minutes': {
    title: '회의록',
    sections: [
      {
        type: 'info',
        table: {
          rows: [
            ['회의명', '[회의 제목]'],
            ['일시', '[회의 일시]'],
            ['장소', '[회의 장소]'],
            ['참석자', '[참석자 명단]'],
            ['작성자', '[작성자 이름]'],
          ],
        },
      },
      { heading: '1. 회의 목적', content: '[회의의 목적과 배경을 서술하세요]' },
      {
        heading: '2. 안건 및 논의 내용',
        table: {
          headers: ['번호', '안건', '논의 내용', '결정사항'],
          rows: [
            ['1', '[안건 1]', '[논의 내용]', '[결정사항]'],
            ['2', '[안건 2]', '[논의 내용]', '[결정사항]'],
          ],
        },
      },
      { heading: '3. 결정사항 요약', content: '[주요 결정사항을 요약하세요]' },
      {
        heading: '4. 후속 조치 (Action Items)',
        table: {
          headers: ['번호', '조치 사항', '담당자', '기한'],
          rows: [
            ['1', '[조치 사항]', '[담당자]', '[기한]'],
            ['2', '[조치 사항]', '[담당자]', '[기한]'],
          ],
        },
      },
      { heading: '5. 차기 회의 일정', content: '[다음 회의 일정 및 안건을 기술하세요]' },
    ],
  },
  'weekly-monthly': {
    title: '주간/월간 업무보고서',
    sections: [
      { type: 'approval' },
      {
        type: 'info',
        table: {
          rows: [
            ['보고 기간', '[보고 기간]'],
            ['부서', '[소속 부서]'],
            ['작성자', '[이름 / 직급]'],
            ['작성일', '[작성일자]'],
          ],
        },
      },
      {
        heading: '1. 금주(금월) 업무 실적',
        table: {
          headers: ['번호', '업무 내용', '진행률', '상태', '비고'],
          rows: [
            ['1', '[업무 내용]', '[00%]', '[완료/진행중/지연]', ''],
            ['2', '[업무 내용]', '[00%]', '[완료/진행중/지연]', ''],
            ['3', '[업무 내용]', '[00%]', '[완료/진행중/지연]', ''],
          ],
        },
      },
      { heading: '2. 주요 성과', content: '[금주(금월) 주요 성과를 서술하세요]' },
      { heading: '3. 이슈 및 리스크', content: '[현재 이슈 사항이나 리스크를 기술하세요]' },
      {
        heading: '4. 차주(차월) 업무 계획',
        table: {
          headers: ['번호', '계획 업무', '목표', '예상 기한'],
          rows: [
            ['1', '[업무 내용]', '[목표]', '[기한]'],
            ['2', '[업무 내용]', '[목표]', '[기한]'],
          ],
        },
      },
      { heading: '5. 건의사항', content: '[건의사항이 있으면 기술하세요]' },
    ],
  },
  performance: {
    title: '실적 보고서',
    sections: [
      { type: 'approval' },
      {
        type: 'info',
        table: {
          rows: [
            ['보고 기간', '[실적 기간]'],
            ['부서', '[소속 부서]'],
            ['작성자', '[이름 / 직급]'],
            ['작성일', '[작성일자]'],
          ],
        },
      },
      { heading: '1. 실적 요약', content: '[전체 실적에 대한 요약을 서술하세요]' },
      {
        heading: '2. 세부 실적',
        table: {
          headers: ['항목', '목표', '실적', '달성률', '비고'],
          rows: [
            ['[항목 1]', '[목표치]', '[실적치]', '[00%]', ''],
            ['[항목 2]', '[목표치]', '[실적치]', '[00%]', ''],
            ['[항목 3]', '[목표치]', '[실적치]', '[00%]', ''],
          ],
        },
      },
      { heading: '3. 성과 분석', content: '[목표 대비 성과를 분석하고 주요 요인을 기술하세요]' },
      { heading: '4. 미달 항목 원인 분석 및 개선 방안', content: '[미달 항목이 있는 경우 원인과 개선 방안을 제시하세요]' },
      { heading: '5. 향후 계획', content: '[차기 기간 목표 및 실행 계획을 기술하세요]' },
    ],
  },
};

export function generateTemplatePreviewHtml(
  reportType: ReportType,
  styleType?: StyleType | null
): string {
  const s = getStyle(styleType);
  const template = REPORT_TEMPLATES[reportType];
  return wrapPage(buildSectionsHtml(template.title, template.sections, s), s);
}

export function generateAIPreviewHtml(
  reportType: ReportType,
  aiContent: AIDocumentContent,
  styleType?: StyleType | null
): string {
  const s = getStyle(styleType);
  const sections: TemplateSection[] = [];

  if (reportType !== 'meeting-minutes') {
    sections.push({ type: 'approval' });
  }

  if (aiContent.info && aiContent.info.length > 0) {
    sections.push({ type: 'info', table: { rows: aiContent.info } });
  }

  for (const sec of aiContent.sections) {
    const ts: TemplateSection = {};
    if (sec.heading) ts.heading = sec.heading;
    if (sec.paragraphs) ts.content = sec.paragraphs.join('\n\n');
    if (sec.table) ts.table = sec.table;
    sections.push(ts);
  }

  return wrapPage(buildSectionsHtml(aiContent.title, sections, s), s);
}

function buildSectionsHtml(title: string, sections: TemplateSection[], s: StyleSettings): string {
  let html = `<h1 style="text-align:center;font-size:${s.titleSize};font-weight:bold;color:${s.titleColor};margin-bottom:24px;font-family:${s.font};">${escapeHtml(title)}</h1>`;

  for (const section of sections) {
    if (section.type === 'approval') {
      html += approvalTableHtml(s);
      continue;
    }
    if (section.type === 'info' && section.table) {
      html += infoTableHtml(section.table.rows, s);
      continue;
    }
    if (section.heading) {
      html += `<h2 style="font-size:${s.headingSize};font-weight:bold;color:${s.headingColor};margin:20px 0 10px;font-family:${s.font};">${escapeHtml(section.heading)}</h2>`;
    }
    if (section.content) {
      const paragraphs = section.content.split('\n\n');
      for (const p of paragraphs) {
        html += `<p style="font-size:${s.bodySize};line-height:1.8;margin-bottom:10px;color:#333;font-family:${s.font};">${escapeHtml(p)}</p>`;
      }
    }
    if (section.table && section.type !== 'info') {
      html += dataTableHtml(section.table.headers, section.table.rows, s);
    }
  }

  return html;
}

function wrapPage(content: string, s: StyleSettings): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    background: #f5f5f5;
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    background: white;
    padding: 40px 48px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-family: ${s.font};
  }
  @media (max-width: 800px) {
    .page {
      width: 100%;
      min-height: auto;
      padding: 24px 20px;
    }
  }
</style>
</head>
<body>
<div class="page">
${content}
</div>
</body>
</html>`;
}

export function generateReplacedPreviewHtml(
  reportType: ReportType,
  styleType: StyleType | null | undefined,
  replacements: Record<string, string>
): string {
  const s = getStyle(styleType);
  const template = REPORT_TEMPLATES[reportType];

  function replaceText(text: string): string {
    let result = text;
    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.split(placeholder).join(value);
    }
    return result;
  }

  const replaced: TemplateSection[] = template.sections.map((section) => {
    const sec = { ...section };
    if (sec.content) sec.content = replaceText(sec.content);
    if (sec.table) {
      sec.table = {
        ...sec.table,
        rows: sec.table.rows.map((row) => row.map((cell) => replaceText(cell))),
      };
    }
    return sec;
  });

  return wrapPage(buildSectionsHtml(template.title, replaced, s), s);
}
