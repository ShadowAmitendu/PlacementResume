export interface ResumeMeta {
  theme: string;
  font: string;
  tableStyle: string;
  marker: string;
  showDeclaration: boolean;
  showLinkIcons: boolean;
  photo: string | null;
  showPhoto?: boolean;
  zoom: number;
  margin?: 'compact' | 'normal' | 'moderate' | 'wide';
  lineHeight?: 'tight' | 'normal' | 'relaxed';
  fitSignatureToPage?: boolean;
}

export type LinkIconType =
  | 'none'
  | 'github'
  | 'linkedin'
  | 'globe'
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'facebook'
  | 'email';

export interface HeaderLink {
  id: string;
  text: string;
  url: string;
  icon: LinkIconType;
}

export interface HeaderData {
  fullName: string;
  degreeTitle: string;
  universityCompany: string;
  location: string;
  email: string;
  phone: string;
  links: HeaderLink[];
}

export type SectionType = 'text' | 'table' | 'list' | 'hr' | 'entries' | 'keyvalue';

export interface BaseSection {
  id: string;
  type: SectionType;
  title: string;
  hidden?: boolean;
  pageBreakBefore?: boolean;
}

export interface TextSectionData extends BaseSection {
  type: 'text';
  content: string;
}

export interface TableSectionData extends BaseSection {
  type: 'table';
  headers?: string[];
  rows: string[][];
  showColBorders?: boolean;
  colWidths?: number[];
  variant?: 'striped' | 'profile';
}

export interface ListSectionData extends BaseSection {
  type: 'list';
  items: string[];
  listType?: 'bullet' | 'numbered';
}

export interface DividerSectionData extends BaseSection {
  type: 'hr';
}

export interface EntryItem {
  id: string;
  heading: string;
  subheading: string;
  dateRange: string;
  location?: string;
  bullets: string[];
}

export interface EntriesSectionData extends BaseSection {
  type: 'entries';
  entries: EntryItem[];
}

export interface KeyValueItem {
  id: string;
  label: string;
  value: string;
}

export interface KeyValueSectionData extends BaseSection {
  type: 'keyvalue';
  pairs: KeyValueItem[];
  labelWidthPct?: number;
}

export type SectionData =
  | TextSectionData
  | TableSectionData
  | ListSectionData
  | DividerSectionData
  | EntriesSectionData
  | KeyValueSectionData;

export interface SavedResumeProfile {
  id: string;
  name: string;
  updatedAt: number;
  data: ResumeData;
}

export interface DeclarationData {
  text: string;
  place: string;
  date: string;
  signature: string;
  signatureImage?: string | null;
}

export interface ResumeData {
  version: 4;
  meta: ResumeMeta;
  header: HeaderData;
  sections: SectionData[];
  declaration: DeclarationData;
}
