import { ResumeData } from '../types/resume';

export interface ThemeConfig {
  name: string;
  label: string;
  color: string;
  bg: string;
  text: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  classic: { name: 'classic', label: 'Classic Black', color: '#000000', bg: '#d9d9d9', text: '#ffffff' },
  navy: { name: 'navy', label: 'Navy Blue', color: '#003366', bg: '#e6edf5', text: '#ffffff' },
  burgundy: { name: 'burgundy', label: 'Burgundy Red', color: '#660000', bg: '#f5e6e6', text: '#ffffff' },
  forest: { name: 'forest', label: 'Forest Green', color: '#004d00', bg: '#e6f0e6', text: '#ffffff' },
  slate: { name: 'slate', label: 'Slate Grey', color: '#4a4a4a', bg: '#eeeeee', text: '#ffffff' },
  teal: { name: 'teal', label: 'Teal', color: '#006666', bg: '#e0f0f0', text: '#ffffff' },
  purple: { name: 'purple', label: 'Deep Purple', color: '#3d0066', bg: '#ede0f0', text: '#ffffff' },
  emerald: { name: 'emerald', label: 'Emerald Green', color: '#10b981', bg: '#d1fae5', text: '#ffffff' },
  violet: { name: 'violet', label: 'Vibrant Violet', color: '#8b5cf6', bg: '#ede9fe', text: '#ffffff' },
  crimson: { name: 'crimson', label: 'Crimson Red', color: '#dc2626', bg: '#fee2e2', text: '#ffffff' },
  amber: { name: 'amber', label: 'Warm Amber', color: '#d97706', bg: '#fef3c7', text: '#ffffff' },
};

export const FONT_OPTIONS = [
  {
    group: 'Computer Modern (LaTeX)',
    options: [
      { label: 'CM Serif (Regular)', value: "'Computer Modern Serif', serif" },
      { label: 'CM Serif Slanted', value: "'Computer Modern Serif Slanted', serif" },
      { label: 'CM Classical Serif Italic', value: "'Computer Modern Classical Serif Italic', serif" },
      { label: 'CM Upright Italic', value: "'Computer Modern Upright Italic', serif" },
      { label: 'CM Concrete', value: "'Computer Modern Concrete', serif" },
      { label: 'CM Bright', value: "'Computer Modern Bright', sans-serif" },
      { label: 'CM Sans', value: "'Computer Modern Sans', sans-serif" },
      { label: 'CM Typewriter', value: "'Computer Modern Typewriter', monospace" },
    ],
  },
  {
    group: 'Serif (Classic)',
    options: [
      { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
      { label: 'Georgia', value: 'Georgia, serif' },
      { label: 'Garamond', value: 'Garamond, serif' },
    ],
  },
  {
    group: 'Sans-Serif (Modern)',
    options: [
      { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
      { label: 'Inter', value: "'Inter', sans-serif" },
      { label: 'Roboto', value: "'Roboto', sans-serif" },
      { label: 'Open Sans', value: "'Open Sans', sans-serif" },
      { label: 'Lato', value: "'Lato', sans-serif" },
      { label: 'Calibri', value: "Calibri, 'Segoe UI', sans-serif" },
      { label: 'Verdana', value: 'Verdana, sans-serif' },
    ],
  },
];

export const TABLE_STYLES = [
  { value: 'standard', label: 'Standard Grid' },
  { value: 'latex', label: 'LaTeX Booktabs' },
  { value: 'word-clean', label: 'Word Clean' },
  { value: 'invisible', label: 'Minimal / No Borders' },
  { value: 'striped-alt', label: 'Alternating Stripes' },
  { value: 'rounded', label: 'Rounded Modern' },
  { value: 'bordered-accent', label: 'Bordered Accent' },
  { value: 'compact', label: 'Compact Dense' },
  { value: 'clean-modern', label: 'Clean Modern' },
  { value: 'classic-double', label: 'Classic Double Border' },
  { value: 'elegant-serif', label: 'Elegant Serif' },
  { value: 'simple-underline', label: 'Simple Underline' },
];

export const SECTION_MARKERS = [
  { value: '➢ ', label: 'Arrow (➢)' },
  { value: '● ', label: 'Bullet (●)' },
  { value: '■ ', label: 'Square (■)' },
  { value: '♦ ', label: 'Diamond (♦)' },
  { value: '▸ ', label: 'Triangle (▸)' },
  { value: '★ ', label: 'Star (★)' },
  { value: '✦ ', label: 'Four-Point Star (✦)' },
  { value: '✔ ', label: 'Check (✔)' },
  { value: '⬥ ', label: 'Black Diamond (⬥)' },
  { value: '› ', label: 'Angle (›)' },
  { value: '» ', label: 'Guillemet (»)' },
  { value: '— ', label: 'Dash (—)' },
  { value: '◆ ', label: 'Filled Diamond (◆)' },
  { value: '○ ', label: 'Circle (○)' },
  { value: '▪ ', label: 'Small Square (▪)' },
  { value: '', label: 'None' },
];

export const MARGIN_OPTIONS = [
  { value: 'compact', label: 'Compact (6mm)' },
  { value: 'normal', label: 'Normal (10mm)' },
  { value: 'moderate', label: 'Moderate (14mm)' },
  { value: 'wide', label: 'Wide (18mm)' },
];

export const LINE_HEIGHT_OPTIONS = [
  { value: 'tight', label: 'Tight (1.15) - Best for 1 page' },
  { value: 'normal', label: 'Normal (1.3)' },
  { value: 'relaxed', label: 'Relaxed (1.5)' },
];

export const DEFAULT_RESUME_DATA: ResumeData = {
  version: 4,
  meta: {
    theme: 'classic',
    font: "'Computer Modern Serif', serif",
    tableStyle: 'standard',
    marker: '➢ ',
    showDeclaration: true,
    showLinkIcons: true,
    photo: null,
    showPhoto: true,
    zoom: 1,
    margin: 'normal',
    lineHeight: 'normal',
  },
  header: {
    fullName: '[Your Full Name]',
    degreeTitle: '[Degree / Job Title]',
    universityCompany: '[University / Company]',
    location: '[City, State, Country]',
    email: '[your.email@example.com]',
    phone: '+91 00000 00000',
    links: [
      { id: '1', text: 'GitHub', url: 'https://github.com/', icon: 'github' },
      { id: '2', text: 'LinkedIn', url: 'https://linkedin.com/in/', icon: 'linkedin' },
      { id: '3', text: 'Portfolio', url: '#', icon: 'globe' },
    ],
  },
  sections: [
    {
      id: 'sec-objective',
      type: 'text',
      title: 'Career Objective:',
      content:
        '[Write a brief, professional summary outlining your career goals, key strengths, and the value you aim to bring to the target organization.]',
    },
    {
      id: 'sec-academics',
      type: 'table',
      title: 'Academic Background:',
      headers: ['Year', 'Qualification', 'Institution / Board', 'Marks / CGPA'],
      rows: [
        ['[Year]', '[Qualification]', '[Institution / Board]', '[Marks / CGPA]'],
      ],
      showColBorders: false,
    },
    {
      id: 'sec-techskills',
      type: 'table',
      title: 'Technical Skills:',
      rows: [
        ['● <strong>[Category e.g. Languages]:</strong> [Python, Java, C++]'],
      ],
      showColBorders: false,
    },
    {
      id: 'sec-profskills',
      type: 'list',
      title: 'Professional Skills:',
      items: ['[Skill 1]', '[Skill 2]', '[Skill 3]'],
      listType: 'bullet',
    },
    {
      id: 'sec-projects',
      type: 'table',
      title: 'Projects:',
      headers: ['Project Name', 'Role / Description / Technologies', 'Duration'],
      rows: [
        [
          '[Project Title]',
          '[Briefly describe what you built, your role, and the tech stack used]',
          '[Month Year]',
        ],
      ],
      showColBorders: false,
    },
    {
      id: 'sec-profile',
      type: 'table',
      title: 'Personal Profile:',
      rows: [
        ['Date of birth', '[DD/MM/YYYY]'],
        ['Gender / Nationality', '[Gender] / [Nationality]'],
        ['Languages known', '[Language 1, Language 2]'],
      ],
      variant: 'profile',
      showColBorders: false,
    },
  ],
  declaration: {
    text: 'I hereby declare that the information given above is true and correct to the best of my knowledge.',
    place: '___________',
    date: '___________',
    signature: 'Signature',
    signatureImage: null,
  },
};
