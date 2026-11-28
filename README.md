# PlacementResume

A 100% client-side, Microsoft Word–inspired WYSIWYG resume builder tailored for campus placements and technical roles. Designed for crisp A4 typesetting with bundled LaTeX (Computer Modern) fonts, drag-and-drop editing, lossless PDF state recovery, and responsive desktop/mobile support—with zero backend required.

## Key Features

- **Word-Style Fluent UI Ribbon**: Organized across `File`, `Home`, `Insert`, `Layout`, `Design`, and `View` tabs, with a collapsible ribbon and Light/Dark UI theme toggle (while keeping the A4 document canvas print-white).
- **Rich Typography & Styling**:
  - **20+ Fonts**: Bundled Computer Modern (`CMU`) LaTeX fonts alongside classic Serif (`Times New Roman`, `Georgia`, `Garamond`) and modern Sans-Serif (`Inter`, `Roboto`, `Open Sans`, `Lato`, `Calibri`, `Verdana`).
  - **11 Accent Themes**: Classic Black, Navy Blue, Burgundy Red, Forest Green, Slate Grey, Teal, Deep Purple, Emerald Green, Vibrant Violet, Crimson Red, and Warm Amber.
  - **16 Section Heading Markers** and **12 Table Style Presets** (Standard Grid, LaTeX Booktabs, Word Clean, Minimal, Alternating Stripes, Rounded Modern, and more).
- **Flexible Block & Table Editor**:
  - **Inline Rich Text**: Bold, italic, underline, strikethrough, subscript, superscript, inline code, small caps, font sizing, text/highlight colors, and paragraph alignment (`left`, `center`, `right`, `justify`).
  - **Drag-and-Drop Sections**: Add, duplicate, delete, and reorder `Text`, `Table`, `List` (bulleted or numbered), and `Divider` sections.
  - **Interactive Tables**: Drag column dividers to resize (double-click to balance), insert/delete rows and columns via hover pills or right-click context menu, and toggle vertical column borders.
  - **Header, Media & Declaration**: Editable contact header with icon links (`GitHub`, `LinkedIn`, `Website`, etc.), profile photo upload & cropping, phone auto-formatting, and declaration section with handwritten signature cleanup.
- **A4 Pagination & Smart Page Fit**:
  - Live `210 mm × 297 mm` A4 layout with automatic **Fit Signature to 1 Page** tightening for slight overflows and automatic multi-page A4 sheet breaks when content expands further.
  - Live footer status bar tracking active page, total pages, word/character count, margins, spacing, Find & Replace, and zoom (`30%–200%`).
- **Import, Export & Offline Storage**:
  - **Browser Auto-Save**: Automatically persists changes locally in `localStorage` with `Ctrl+Z` / `Ctrl+Y` undo/redo history (up to 60 snapshots) and `Ctrl+S` quick save.
  - **Print / Export PDF**: Native clean `@media print` A4 output that embeds the resume JSON into PDF metadata (`RSBLD::`) so PDFs exported from the site can be re-imported losslessly later.
  - **PDF Parser**: Extract content from external resume PDFs client-side via PDF.js using the built-in heuristic parser, Chrome built-in AI (`window.ai`), or a user-supplied Gemini API key.
  - **Project Backups**: Export `.rsbld` backups and import `.rsbld`, legacy `.resumeBuilder`, `.json`, `.html`, `.pdf`, or `#import=` URL hashes.
- **Responsive Mobile Support**: Automatic fit-to-screen scaling on smaller viewports, touch-friendly controls, horizontally scrollable ribbon groups, and responsive dialogs.

## Tech Stack

- **Framework**: React 19, TypeScript, Vite
- **UI & Styling**: Fluent UI React Components & Icons (`@fluentui/react-components`, `@fluentui/react-icons`), Tailwind CSS v4
- **Interactions**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **PDF Parsing**: `pdfjs-dist`
- **Testing**: Vitest, jsdom

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server (http://localhost:5173)
npm run dev

# Run TypeScript check
npm run typecheck

# Run unit tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + S` | Save to browser storage |
| `Ctrl/Cmd + F` / `Ctrl/Cmd + H` | Find & Replace |
| `Ctrl/Cmd + Z` / `Ctrl/Cmd + Y` | Undo / Redo (outside active text fields) |
| `Ctrl/Cmd + +` / `Ctrl/Cmd + -` | Zoom in / out (also `Ctrl/Cmd + Mouse Wheel`) |
| `Ctrl/Cmd + 0` | Reset zoom to 100% |

## Project Structure

```text
public/
  favicon.svg
src/
  components/
    modals/        # Crop, Export, Find & Replace, Link, PDF Import, Signature, Confirm/Alert
    resume/        # A4 Canvas, Header, Declaration, Status Bar, EditableContent, Section renderers
    ribbon/        # Fluent UI Ribbon & tabs (File, Home, Insert, Layout, Design, View)
  constants/       # Themes, font lists, table presets, default placement template
  context/         # ResumeContext global state, shortcuts, persistence, import/export
  fonts/           # Bundled Computer Modern (.ttf) fonts & SIL Open Font License
  hooks/           # Undo/redo history hook
  styles/          # Fluent themes, font declarations, A4 canvas & print CSS
  types/           # TypeScript data model definitions
  utils/           # PDF extractor, AI/heuristic parser, sanitizer, migration, metrics, table helpers
  __tests__/       # Vitest unit tests
```

## Privacy

All editing, storage (`localStorage`), `.rsbld` backup generation, PDF text extraction, and local resume parsing happen directly in your browser. External network calls occur only when loading Google Fonts (`Inter`, `Roboto`, `Open Sans`, `Lato`) or when you explicitly provide your own Google Gemini API key for AI PDF parsing.
