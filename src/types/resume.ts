export interface ResumeMeta {
  theme: string;
  font: string;
  tableStyle: string;
  marker: string;
  showDeclaration: boolean;
  showLinkIcons: boolean;
  photo: string | null;
  zoom: number;
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

export type SectionType = 'text' | 'table' | 'list' | 'hr';

export interface BaseSection {
  id: string;
  type: SectionType;
  title: string;
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
}

export interface DividerSectionData extends BaseSection {
  type: 'hr';
}

export type SectionData =
  | TextSectionData
  | TableSectionData
  | ListSectionData
  | DividerSectionData;

export interface DeclarationData {
  text: string;
  place: string;
  date: string;
  signature: string;
}

export interface ResumeData {
  version: 4;
  meta: ResumeMeta;
  header: HeaderData;
  sections: SectionData[];
  declaration: DeclarationData;
}
