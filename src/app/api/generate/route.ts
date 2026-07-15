import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Packer } from 'docx';
import { buildContentFillPrompt, buildCustomFeedbackPrompt, buildCustomFormPrompt, buildCustomEditPrompt, buildStyleFromPrompt } from '@/lib/prompts';
import { buildDocument, buildDocumentFromAI, buildDocumentWithReplacements, extractPlaceholders, AIDocumentContent } from '@/lib/docx-builder';
import { generateTemplatePreviewHtml, generateAIPreviewHtml, generateReplacedPreviewHtml } from '@/lib/html-preview';
import { ReportType, StyleType, REPORT_TYPES, CustomStyleSpec } from '@/types';

type StyleArg = StyleType | CustomStyleSpec | undefined;
import { randomUUID } from 'crypto';
import { saveReport } from '@/lib/reports';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 구조화 JSON 출력 전용 모델 — JSON 모드 + 낮은 temperature + 출력 상한으로 지연을 줄인다.
function jsonModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });
}

function parseAIResponse<T>(responseText: string): T | null {
  try {
    const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function labelForAction(
  action: string,
  style?: StyleType
): string {
  switch (action) {
    case 'generate':
      return '기본 양식';
    case 'style': {
      const styleLabels: Record<string, string> = {
        corporate: '대기업',
        'global-startup': '스타트업',
        government: '정부',
      };
      return `${styleLabels[style || ''] || ''} 스타일`.trim();
    }
    case 'custom-feedback':
      return '피드백 반영';
    case 'content':
      return '내용 작성';
    default:
      return '수정';
  }
}

export async function POST(req: NextRequest) {
  try {
    // 프로젝트는 브라우저(게스트) 단위로 보관한다 — 로그인 없이 생성 가능.
    const guestId = req.headers.get('x-guest-id');
    if (!guestId) {
      return NextResponse.json({ error: 'MISSING_GUEST' }, { status: 400 });
    }

    const body = await req.json();
    const { action, reportType, style, customFeedback, userInput, sessionId, version: currentVersion } = body;

    const sid = sessionId || randomUUID();
    const nextVersion = (currentVersion || 0) + 1;
    const filename = `report_v${nextVersion}.docx`;
    const reportLabel =
      REPORT_TYPES.find((r) => r.id === reportType)?.label ?? '문서 양식';

    const persist = async (
      buffer: Buffer,
      opts: {
        label: string;
        style?: StyleArg | null;
        title?: string | null;
        previewHtml?: string | null;
        aiContent?: unknown;
      }
    ) => {
      const row = await saveReport({
        guestId,
        sessionId: sid,
        version: nextVersion,
        reportType: (reportType as string) ?? null,
        // 프리셋(문자열)만 저장 — 자유 스타일 사양 객체는 style 컬럼에 넣지 않는다.
        style: typeof opts.style === 'string' ? opts.style : null,
        label: opts.label,
        title: opts.title ?? reportLabel,
        previewHtml: opts.previewHtml ?? null,
        aiContent: opts.aiContent ?? null,
        buffer,
        filename,
      });
      return row.id;
    };

    switch (action) {
      case 'generate': {
        const doc = buildDocument(reportType as ReportType);
        const buffer = await Packer.toBuffer(doc);
        const previewHtml = generateTemplatePreviewHtml(reportType as ReportType);
        const reportId = await persist(buffer, {
          label: labelForAction('generate'),
          previewHtml,
        });

        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          message: '기본 양식이 생성되었습니다.',
          version: nextVersion,
        });
      }

      case 'style': {
        const styleT = style as StyleType;

        // 스타일은 템플릿을 결정적으로 다시 빌드한다 — 별도 Gemini 호출 없이 즉시 처리.
        const doc = buildDocument(reportType as ReportType, styleT);
        const buffer = await Packer.toBuffer(doc);
        const previewHtml = generateTemplatePreviewHtml(reportType as ReportType, styleT);
        const reportId = await persist(buffer, {
          label: labelForAction('style', styleT),
          style: styleT,
          previewHtml,
        });

        const styleLabels: Record<string, string> = {
          corporate: '대기업',
          'global-startup': '글로벌 스타트업',
          government: '공무원/정부',
        };
        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          message: `${styleLabels[styleT] || ''} 스타일을 적용했습니다.`.trim(),
          version: nextVersion,
        });
      }

      case 'custom-feedback': {
        const currentStyle = body.currentStyle as StyleArg;
        const model = jsonModel();
        const prompt = buildCustomFeedbackPrompt(
          reportType as ReportType,
          customFeedback,
          typeof currentStyle === 'string' ? currentStyle : null
        );
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const aiContent = parseAIResponse<AIDocumentContent & { message?: string }>(responseText);
        if (!aiContent) {
          return NextResponse.json({
            sessionId: sid,
            message: '피드백 처리에 실패했습니다. 다시 시도해주세요.',
            error: 'parse_error',
          });
        }

        const doc = buildDocumentFromAI(reportType as ReportType, aiContent, currentStyle);
        const buffer = await Packer.toBuffer(doc);
        const previewHtml = generateAIPreviewHtml(reportType as ReportType, aiContent, currentStyle);
        const reportId = await persist(buffer, {
          label: labelForAction('custom-feedback'),
          style: currentStyle,
          title: aiContent.title || reportLabel,
          previewHtml,
        });

        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          message: aiContent.message || '피드백이 반영되었습니다.',
          version: nextVersion,
        });
      }

      case 'content': {
        const currentStyle = body.currentStyle as StyleArg;
        const placeholders = extractPlaceholders(reportType as ReportType);

        const model = jsonModel();
        const prompt = buildContentFillPrompt(reportType as ReportType, placeholders, userInput);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const parsed = parseAIResponse<{ replacements: Record<string, string>; message?: string; title?: string }>(responseText);
        if (!parsed?.replacements) {
          return NextResponse.json({
            sessionId: sid,
            message: '내용 작성에 실패했습니다. 다시 시도해주세요.',
            error: 'parse_error',
          });
        }

        const doc = buildDocumentWithReplacements(reportType as ReportType, currentStyle, parsed.replacements);
        const buffer = await Packer.toBuffer(doc);
        const previewHtml = generateReplacedPreviewHtml(reportType as ReportType, currentStyle, parsed.replacements);
        const reportId = await persist(buffer, {
          label: labelForAction('content'),
          style: currentStyle,
          title: parsed.title || reportLabel,
          previewHtml,
        });

        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          message: parsed.message || '양식 내용이 작성되었습니다.',
          version: nextVersion,
        });
      }

      // ── 커스텀(프롬프트 기반) 양식 ──
      case 'custom-generate': {
        const userPrompt = String(body.prompt || '').trim();
        if (!userPrompt) {
          return NextResponse.json({ error: 'EMPTY_PROMPT' }, { status: 400 });
        }
        const model = jsonModel();
        const result = await model.generateContent(buildCustomFormPrompt(userPrompt));
        const ai = parseAIResponse<AIDocumentContent & { message?: string }>(result.response.text());
        if (!ai?.sections) {
          return NextResponse.json({
            sessionId: sid,
            message: '양식 생성에 실패했습니다. 다시 시도해주세요.',
            error: 'parse_error',
          });
        }
        const doc = buildDocumentFromAI(null, ai);
        const buffer = await Packer.toBuffer(doc);
        const previewHtml = generateAIPreviewHtml(null, ai);
        const reportId = await persist(buffer, {
          label: '맞춤 양식',
          title: ai.title || reportLabel,
          previewHtml,
          aiContent: ai,
        });
        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          aiContent: ai,
          message: ai.message || '맞춤 양식을 생성했습니다.',
          version: nextVersion,
        });
      }

      case 'custom-style': {
        const currentStyle = body.style as StyleType | undefined;
        const ai = body.aiContent as AIDocumentContent | undefined;
        if (!ai?.sections) {
          return NextResponse.json({ error: 'MISSING_CONTENT' }, { status: 400 });
        }
        const doc = buildDocumentFromAI(null, ai, currentStyle);
        const buffer = await Packer.toBuffer(doc);
        const previewHtml = generateAIPreviewHtml(null, ai, currentStyle);
        const reportId = await persist(buffer, {
          label: labelForAction('style', currentStyle),
          style: currentStyle,
          title: ai.title || reportLabel,
          previewHtml,
          aiContent: ai,
        });
        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          aiContent: ai,
          message: '스타일을 적용했습니다.',
          version: nextVersion,
        });
      }

      case 'custom-edit': {
        const currentStyle = body.currentStyle as StyleArg;
        const ai = body.aiContent as AIDocumentContent | undefined;
        const instruction = String(body.instruction || '').trim();
        if (!ai?.sections || !instruction) {
          return NextResponse.json({ error: 'MISSING_CONTENT' }, { status: 400 });
        }
        const model = jsonModel();
        const result = await model.generateContent(
          buildCustomEditPrompt(JSON.stringify(ai), instruction)
        );
        const edited = parseAIResponse<AIDocumentContent & { message?: string }>(result.response.text());
        if (!edited?.sections) {
          return NextResponse.json({
            sessionId: sid,
            message: '수정에 실패했습니다. 다시 시도해주세요.',
            error: 'parse_error',
          });
        }
        const doc = buildDocumentFromAI(null, edited, currentStyle);
        const buffer = await Packer.toBuffer(doc);
        const previewHtml = generateAIPreviewHtml(null, edited, currentStyle);
        const reportId = await persist(buffer, {
          label: labelForAction('content'),
          style: currentStyle,
          title: edited.title || reportLabel,
          previewHtml,
          aiContent: edited,
        });
        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          aiContent: edited,
          message: edited.message || '양식을 수정했습니다.',
          version: nextVersion,
        });
      }

      // ── 자유 스타일(프롬프트로 색·폰트 지정) ──
      case 'style-prompt': {
        const userPrompt = String(body.prompt || '').trim();
        if (!userPrompt) {
          return NextResponse.json({ error: 'EMPTY_PROMPT' }, { status: 400 });
        }
        const ai = body.aiContent as AIDocumentContent | undefined;
        const model = jsonModel();
        const result = await model.generateContent(buildStyleFromPrompt(userPrompt));
        const spec = parseAIResponse<CustomStyleSpec & { message?: string }>(result.response.text());
        if (!spec?.font) {
          return NextResponse.json({
            sessionId: sid,
            message: '스타일 적용에 실패했습니다. 다시 시도해주세요.',
            error: 'parse_error',
          });
        }
        const doc = ai?.sections
          ? buildDocumentFromAI(null, ai, spec)
          : buildDocument(reportType as ReportType, spec);
        const buffer = await Packer.toBuffer(doc);
        const previewHtml = ai?.sections
          ? generateAIPreviewHtml(null, ai, spec)
          : generateTemplatePreviewHtml(reportType as ReportType, spec);
        const reportId = await persist(buffer, {
          label: '스타일 변경',
          previewHtml,
          aiContent: ai ?? undefined,
        });
        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          styleSpec: spec,
          aiContent: ai ?? undefined,
          message: spec.message || '스타일을 적용했습니다.',
          version: nextVersion,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Generate API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
