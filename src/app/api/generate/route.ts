import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Packer } from 'docx';
import { buildStyleFeedbackPrompt, buildContentFillPrompt, buildCustomFeedbackPrompt } from '@/lib/prompts';
import { buildDocument, buildDocumentFromAI, buildDocumentWithReplacements, extractPlaceholders, AIDocumentContent } from '@/lib/docx-builder';
import { generateTemplatePreviewHtml, generateAIPreviewHtml, generateReplacedPreviewHtml } from '@/lib/html-preview';
import { ReportType, StyleType } from '@/types';
import { randomUUID } from 'crypto';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { saveReport } from '@/lib/reports';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    const { action, reportType, style, styleHistory, customFeedback, userInput, sessionId, version: currentVersion } = body;

    const sid = sessionId || randomUUID();
    const nextVersion = (currentVersion || 0) + 1;
    const filename = `report_v${nextVersion}.docx`;

    const persist = async (buffer: Buffer, label: string, styleForRow?: StyleType) => {
      const row = await saveReport({
        userId: user.id,
        sessionId: sid,
        version: nextVersion,
        reportType: (reportType as string) ?? null,
        style: styleForRow ?? null,
        label,
        buffer,
        filename,
      });
      return row.id;
    };

    switch (action) {
      case 'generate': {
        const doc = buildDocument(reportType as ReportType);
        const buffer = await Packer.toBuffer(doc);
        const reportId = await persist(buffer, labelForAction('generate'));
        const previewHtml = generateTemplatePreviewHtml(reportType as ReportType);

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
        const history = (styleHistory || []) as StyleType[];

        const doc = buildDocument(reportType as ReportType, styleT);
        const buffer = await Packer.toBuffer(doc);
        const reportId = await persist(buffer, labelForAction('style', styleT), styleT);
        const previewHtml = generateTemplatePreviewHtml(reportType as ReportType, styleT);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = buildStyleFeedbackPrompt(reportType as ReportType, styleT, history, customFeedback);
        const result = await model.generateContent(prompt);
        const feedbackMessage = result.response.text();

        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          message: feedbackMessage,
          version: nextVersion,
        });
      }

      case 'custom-feedback': {
        const currentStyle = body.currentStyle as StyleType | undefined;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = buildCustomFeedbackPrompt(
          reportType as ReportType,
          customFeedback,
          currentStyle
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
        const reportId = await persist(buffer, labelForAction('custom-feedback'), currentStyle);
        const previewHtml = generateAIPreviewHtml(reportType as ReportType, aiContent, currentStyle);

        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          message: aiContent.message || '피드백이 반영되었습니다.',
          version: nextVersion,
        });
      }

      case 'content': {
        const currentStyle = body.currentStyle as StyleType | undefined;
        const placeholders = extractPlaceholders(reportType as ReportType);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = buildContentFillPrompt(reportType as ReportType, placeholders, userInput);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const parsed = parseAIResponse<{ replacements: Record<string, string>; message?: string }>(responseText);
        if (!parsed?.replacements) {
          return NextResponse.json({
            sessionId: sid,
            message: '내용 작성에 실패했습니다. 다시 시도해주세요.',
            error: 'parse_error',
          });
        }

        const doc = buildDocumentWithReplacements(reportType as ReportType, currentStyle, parsed.replacements);
        const buffer = await Packer.toBuffer(doc);
        const reportId = await persist(buffer, labelForAction('content'), currentStyle);
        const previewHtml = generateReplacedPreviewHtml(reportType as ReportType, currentStyle, parsed.replacements);

        return NextResponse.json({
          sessionId: sid,
          reportId,
          previewHtml,
          message: parsed.message || '보고서 내용이 작성되었습니다.',
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
