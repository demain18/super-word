import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
  PageNumber,
  Footer,
  Header,
  convertInchesToTwip,
  TableLayoutType,
  VerticalAlign,
  ShadingType,
} from 'docx';
import { ReportType, StyleType } from '@/types';

interface DocumentContent {
  title: string;
  sections: Section[];
  metadata?: Record<string, string>;
}

interface Section {
  heading?: string;
  content?: string;
  table?: TableData;
  type?: 'approval' | 'info' | 'body' | 'signature';
}

interface TableData {
  headers?: string[];
  rows: string[][];
  columnWidths?: number[];
}

const STYLE_CONFIG: Record<StyleType | 'default', StyleSettings> = {
  default: {
    titleSize: 32,
    headingSize: 26,
    bodySize: 22,
    font: '맑은 고딕',
    titleColor: '000000',
    headingColor: '333333',
    accentColor: '4472C4',
    borderColor: '999999',
    headerBgColor: 'E7E6E6',
  },
  corporate: {
    titleSize: 34,
    headingSize: 28,
    bodySize: 22,
    font: '맑은 고딕',
    titleColor: '1F3864',
    headingColor: '1F3864',
    accentColor: '1F3864',
    borderColor: '1F3864',
    headerBgColor: 'D6DCE4',
  },
  'global-startup': {
    titleSize: 36,
    headingSize: 28,
    bodySize: 22,
    font: '맑은 고딕',
    titleColor: '2D2D2D',
    headingColor: '0066FF',
    accentColor: '0066FF',
    borderColor: 'CCCCCC',
    headerBgColor: 'F0F4FF',
  },
  government: {
    titleSize: 32,
    headingSize: 26,
    bodySize: 22,
    font: '바탕',
    titleColor: '000000',
    headingColor: '000000',
    accentColor: '000000',
    borderColor: '000000',
    headerBgColor: 'F2F2F2',
  },
};

interface StyleSettings {
  titleSize: number;
  headingSize: number;
  bodySize: number;
  font: string;
  titleColor: string;
  headingColor: string;
  accentColor: string;
  borderColor: string;
  headerBgColor: string;
}

function getStyle(styleType?: StyleType | null): StyleSettings {
  if (!styleType) return STYLE_CONFIG.default;
  return STYLE_CONFIG[styleType];
}

function thinBorder(color: string) {
  return {
    style: BorderStyle.SINGLE,
    size: 1,
    color,
  };
}

function createApprovalTable(style: StyleSettings): Table {
  const borders = {
    top: thinBorder(style.borderColor),
    bottom: thinBorder(style.borderColor),
    left: thinBorder(style.borderColor),
    right: thinBorder(style.borderColor),
  };

  return new Table({
    width: { size: 40, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: ['구분', '작성자', '검토자', '승인자'].map(
          (text) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text, font: style.font, size: 18, bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              borders,
              shading: { type: ShadingType.SOLID, color: style.headerBgColor },
              verticalAlign: VerticalAlign.CENTER,
              width: { size: 25, type: WidthType.PERCENTAGE },
            })
        ),
      }),
      new TableRow({
        children: ['성명', '', '', ''].map(
          (text) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text, font: style.font, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            })
        ),
        height: { value: convertInchesToTwip(0.4), rule: 'atLeast' as const },
      }),
      new TableRow({
        children: ['서명', '', '', ''].map(
          (text) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text, font: style.font, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            })
        ),
        height: { value: convertInchesToTwip(0.6), rule: 'atLeast' as const },
      }),
    ],
  });
}

function createInfoTable(rows: string[][], style: StyleSettings): Table {
  const borders = {
    top: thinBorder(style.borderColor),
    bottom: thinBorder(style.borderColor),
    left: thinBorder(style.borderColor),
    right: thinBorder(style.borderColor),
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: rows.map(
      (row) =>
        new TableRow({
          children: row.map((cell, i) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell,
                      font: style.font,
                      size: style.bodySize,
                      bold: i === 0,
                    }),
                  ],
                  alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                }),
              ],
              borders,
              shading: i === 0 ? { type: ShadingType.SOLID, color: style.headerBgColor } : undefined,
              verticalAlign: VerticalAlign.CENTER,
              width: { size: i === 0 ? 25 : 75, type: WidthType.PERCENTAGE },
            })
          ),
          height: { value: convertInchesToTwip(0.35), rule: 'atLeast' as const },
        })
    ),
  });
}

function createDataTable(data: TableData, style: StyleSettings): Table {
  const borders = {
    top: thinBorder(style.borderColor),
    bottom: thinBorder(style.borderColor),
    left: thinBorder(style.borderColor),
    right: thinBorder(style.borderColor),
  };

  const tableRows: TableRow[] = [];

  if (data.headers) {
    tableRows.push(
      new TableRow({
        children: data.headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: header, font: style.font, size: style.bodySize, bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              borders,
              shading: { type: ShadingType.SOLID, color: style.headerBgColor },
              verticalAlign: VerticalAlign.CENTER,
            })
        ),
      })
    );
  }

  data.rows.forEach((row) => {
    tableRows.push(
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cell, font: style.font, size: style.bodySize })],
                }),
              ],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            })
        ),
        height: { value: convertInchesToTwip(0.3), rule: 'atLeast' as const },
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: tableRows,
  });
}

const REPORT_TEMPLATES: Record<ReportType, (style: StyleSettings) => DocumentContent> = {
  'field-work': (style) => ({
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
      {
        heading: '1. 외근 개요',
        content: '[외근의 전반적인 목적과 배경을 서술하세요]',
      },
      {
        heading: '2. 방문 내용',
        content: '[방문 대상, 미팅 내용, 논의 사항 등을 상세히 기술하세요]',
      },
      {
        heading: '3. 주요 성과 및 결과',
        content: '[외근을 통해 달성한 성과나 합의 사항을 정리하세요]',
      },
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
      {
        heading: '5. 기타 참고사항',
        content: '[추가 참고사항이 있으면 기술하세요]',
      },
    ],
  }),

  'business-trip': (style) => ({
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
      {
        heading: '1. 출장 개요',
        content: '[출장의 배경 및 목적을 서술하세요]',
      },
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
      {
        heading: '3. 주요 성과',
        content: '[출장을 통해 달성한 성과를 정리하세요]',
      },
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
      {
        heading: '5. 후속 조치 및 건의사항',
        content: '[후속 조치 사항 및 건의사항을 기술하세요]',
      },
    ],
  }),

  'meeting-minutes': (style) => ({
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
      {
        heading: '1. 회의 목적',
        content: '[회의의 목적과 배경을 서술하세요]',
      },
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
      {
        heading: '3. 결정사항 요약',
        content: '[주요 결정사항을 요약하세요]',
      },
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
      {
        heading: '5. 차기 회의 일정',
        content: '[다음 회의 일정 및 안건을 기술하세요]',
      },
    ],
  }),

  'weekly-monthly': (style) => ({
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
      {
        heading: '2. 주요 성과',
        content: '[금주(금월) 주요 성과를 서술하세요]',
      },
      {
        heading: '3. 이슈 및 리스크',
        content: '[현재 이슈 사항이나 리스크를 기술하세요]',
      },
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
      {
        heading: '5. 건의사항',
        content: '[건의사항이 있으면 기술하세요]',
      },
    ],
  }),

  performance: (style) => ({
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
      {
        heading: '1. 실적 요약',
        content: '[전체 실적에 대한 요약을 서술하세요]',
      },
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
      {
        heading: '3. 성과 분석',
        content: '[목표 대비 성과를 분석하고 주요 요인을 기술하세요]',
      },
      {
        heading: '4. 미달 항목 원인 분석 및 개선 방안',
        content: '[미달 항목이 있는 경우 원인과 개선 방안을 제시하세요]',
      },
      {
        heading: '5. 향후 계획',
        content: '[차기 기간 목표 및 실행 계획을 기술하세요]',
      },
    ],
  }),
};

export function buildDocument(
  reportType: ReportType,
  styleType?: StyleType | null,
): Document {
  const style = getStyle(styleType);
  const template = REPORT_TEMPLATES[reportType](style);

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: template.title,
          font: style.font,
          size: style.titleSize,
          bold: true,
          color: style.titleColor,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Sections
  for (const section of template.sections) {
    if (section.type === 'approval') {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 200 },
          children: [],
        })
      );
      children.push(createApprovalTable(style));
      children.push(new Paragraph({ spacing: { after: 300 }, children: [] }));
      continue;
    }

    if (section.type === 'info' && section.table) {
      children.push(createInfoTable(section.table.rows, style));
      children.push(new Paragraph({ spacing: { after: 300 }, children: [] }));
      continue;
    }

    if (section.heading) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.heading,
              font: style.font,
              size: style.headingSize,
              bold: true,
              color: style.headingColor,
            }),
          ],
          spacing: { before: 300, after: 150 },
        })
      );
    }

    if (section.content) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              font: style.font,
              size: style.bodySize,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    if (section.table && section.type !== 'info') {
      children.push(createDataTable(section.table, style));
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1701,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: template.title,
                    font: style.font,
                    size: 16,
                    color: '999999',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Page ', font: style.font, size: 16, color: '999999' }),
                  new TextRun({ children: [PageNumber.CURRENT], font: style.font, size: 16, color: '999999' }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

export function buildDocumentFromAI(
  reportType: ReportType,
  aiContent: AIDocumentContent,
  styleType?: StyleType | null,
): Document {
  const style = getStyle(styleType);
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: aiContent.title,
          font: style.font,
          size: style.titleSize,
          bold: true,
          color: style.titleColor,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Approval table if applicable
  if (reportType !== 'meeting-minutes') {
    children.push(createApprovalTable(style));
    children.push(new Paragraph({ spacing: { after: 300 }, children: [] }));
  }

  // Info table
  if (aiContent.info && aiContent.info.length > 0) {
    children.push(createInfoTable(aiContent.info, style));
    children.push(new Paragraph({ spacing: { after: 300 }, children: [] }));
  }

  // Sections
  for (const section of aiContent.sections) {
    if (section.heading) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.heading,
              font: style.font,
              size: style.headingSize,
              bold: true,
              color: style.headingColor,
            }),
          ],
          spacing: { before: 300, after: 150 },
        })
      );
    }

    if (section.paragraphs) {
      for (const para of section.paragraphs) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: para,
                font: style.font,
                size: style.bodySize,
              }),
            ],
            spacing: { after: 120 },
          })
        );
      }
    }

    if (section.table) {
      children.push(createDataTable(section.table, style));
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1701,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: aiContent.title,
                    font: style.font,
                    size: 16,
                    color: '999999',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Page ', font: style.font, size: 16, color: '999999' }),
                  new TextRun({ children: [PageNumber.CURRENT], font: style.font, size: 16, color: '999999' }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

export interface AIDocumentContent {
  title: string;
  info: string[][];
  sections: AISection[];
}

interface AISection {
  heading?: string;
  paragraphs?: string[];
  table?: TableData;
}

export function extractPlaceholders(reportType: ReportType): string[] {
  const style = getStyle(null);
  const template = REPORT_TEMPLATES[reportType](style);
  const placeholders: string[] = [];
  const regex = /\[([^\]]+)\]/g;

  for (const section of template.sections) {
    if (section.type === 'info' && section.table) {
      for (const row of section.table.rows) {
        for (const cell of row) {
          let match;
          while ((match = regex.exec(cell)) !== null) {
            placeholders.push(match[0]);
          }
        }
      }
    }
    if (section.content) {
      let match;
      while ((match = regex.exec(section.content)) !== null) {
        placeholders.push(match[0]);
      }
    }
    if (section.table && section.type !== 'info') {
      for (const row of section.table.rows) {
        for (const cell of row) {
          let match;
          while ((match = regex.exec(cell)) !== null) {
            placeholders.push(match[0]);
          }
        }
      }
    }
  }

  return [...new Set(placeholders)];
}

export function buildDocumentWithReplacements(
  reportType: ReportType,
  styleType: StyleType | null | undefined,
  replacements: Record<string, string>,
): Document {
  const style = getStyle(styleType);
  const template = REPORT_TEMPLATES[reportType](style);

  function replaceText(text: string): string {
    let result = text;
    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.split(placeholder).join(value);
    }
    return result;
  }

  const replaced = {
    ...template,
    sections: template.sections.map((section) => {
      const s = { ...section };
      if (s.content) {
        s.content = replaceText(s.content);
      }
      if (s.table) {
        s.table = {
          ...s.table,
          rows: s.table.rows.map((row) => row.map((cell) => replaceText(cell))),
        };
      }
      return s;
    }),
  };

  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: replaced.title,
          font: style.font,
          size: style.titleSize,
          bold: true,
          color: style.titleColor,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  for (const section of replaced.sections) {
    if (section.type === 'approval') {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 200 },
          children: [],
        })
      );
      children.push(createApprovalTable(style));
      children.push(new Paragraph({ spacing: { after: 300 }, children: [] }));
      continue;
    }

    if (section.type === 'info' && section.table) {
      children.push(createInfoTable(section.table.rows, style));
      children.push(new Paragraph({ spacing: { after: 300 }, children: [] }));
      continue;
    }

    if (section.heading) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.heading,
              font: style.font,
              size: style.headingSize,
              bold: true,
              color: style.headingColor,
            }),
          ],
          spacing: { before: 300, after: 150 },
        })
      );
    }

    if (section.content) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              font: style.font,
              size: style.bodySize,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    if (section.table && section.type !== 'info') {
      children.push(createDataTable(section.table, style));
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1701,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: replaced.title,
                    font: style.font,
                    size: 16,
                    color: '999999',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Page ', font: style.font, size: 16, color: '999999' }),
                  new TextRun({ children: [PageNumber.CURRENT], font: style.font, size: 16, color: '999999' }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}
