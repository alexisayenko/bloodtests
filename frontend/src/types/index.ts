export interface Analysis {
  loinc: string;
  longCommonName: string;
  displayName: string;
  lang: Record<string, string>;
  info?: AnalysisInfo;
}

export interface AnalysisInfo {
  description?: string;
  scientific?: string;
  why?: string;
  frequency?: string;
  lang?: Record<string, Partial<AnalysisInfo>>;
}

export interface PanelSection {
  name: string;
  lang: Record<string, string>;
  loincs: string[];
}

export interface Panel {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  iconFile?: string;
  lang: Record<string, string>;
  loincs?: string[];
  sections?: PanelSection[];
}

export interface Result {
  loinc: string;
  analysis: string;
  symbol: string;
  section: string;
  value: number | null;
  rawValue: string;
  valueQualifier: string;
  unit: string;
  refText: string;
  refMin: number | null;
  refMax: number | null;
  method: string;
}

export interface TestSession {
  id: string;
  date: string;
  place: string;
  sourceFile?: string;
  notes?: string;
}

export interface ResultGroup {
  date: string;
  place: string;
  file: string; // session UUID
  items: Result[] | null;
  itemCount: number;
}

export interface PlannedTest {
  id: string;
  plannedDate: string;
  testType: string;
  notes: string;
}

export interface TestingScheduleEntry {
  id: string;
  panelId: string | null;
  loinc: string | null;
  frequencyMonths: number;
}

export type FrequencyPreset = 1 | 3 | 6 | 12 | 24;

export type ViewName = 'panels' | 'panel-detail' | 'results' | 'analytics' | 'planning' | 'upcoming';
export type PanelViewMode = 'minimal' | 'compact' | 'detailed';
export type Lang = 'en' | 'ru-RU' | 'uk-UA';
