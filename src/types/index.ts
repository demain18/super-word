export type ReportType =
  | 'field-work'
  | 'business-trip'
  | 'meeting-minutes'
  | 'weekly-monthly'
  | 'performance';

export type StyleType = 'corporate' | 'global-startup' | 'government';

export interface ReportTypeInfo {
  id: ReportType;
  label: string;
  description: string;
  icon: string;
}

export interface StyleOption {
  id: StyleType;
  label: string;
  description: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface VersionEntry {
  version: number;
  docxUrl: string;
  previewHtml: string;
  label: string;
}

export interface AppState {
  currentStep: 1 | 2 | 3;
  selectedReport: ReportType | null;
  selectedStyle: StyleType | null;
  styleHistory: StyleType[];
  docxUrl: string | null;
  isLoading: boolean;
  loadingMessage: string;
  messages: Message[];
  sessionId: string;
  versions: VersionEntry[];
  currentVersionIndex: number;
  lockedVersionIndex: number | null;
}

export const REPORT_TYPES: ReportTypeInfo[] = [
  {
    id: 'field-work',
    label: '외근 보고서',
    description: '외근 활동 내용과 결과를 정리하는 보고서',
    icon: '🏢',
  },
  {
    id: 'business-trip',
    label: '출장 보고서',
    description: '출장 일정, 목적, 결과를 상세히 기록하는 보고서',
    icon: '✈️',
  },
  {
    id: 'meeting-minutes',
    label: '회의록',
    description: '회의 내용, 결정사항, 후속조치를 정리하는 문서',
    icon: '📋',
  },
  {
    id: 'weekly-monthly',
    label: '주간/월간 업무보고서',
    description: '주간 또는 월간 업무 진행 현황을 보고하는 문서',
    icon: '📊',
  },
  {
    id: 'performance',
    label: '실적 보고서',
    description: '업무 성과와 실적을 수치와 함께 보고하는 문서',
    icon: '📈',
  },
];

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'corporate',
    label: '대기업 스타일',
    description: '전통적이고 격식 있는 대기업 보고서 양식',
  },
  {
    id: 'global-startup',
    label: '글로벌 스타트업 스타일',
    description: '트렌디하고 모던한 글로벌 기업 양식',
  },
  {
    id: 'government',
    label: '공무원/정부 스타일',
    description: '공문서 형식의 정부·공공기관 양식',
  },
];
