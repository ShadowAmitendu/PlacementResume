import {
  ResumeData,
  TextSectionData,
  ListSectionData,
  TableSectionData,
  EntriesSectionData,
  KeyValueSectionData,
} from '../types/resume';
import { htmlToPlainText } from './documentMetrics';

const cleanText = (html?: string | null): string =>
  htmlToPlainText(html).replace(/\s+/g, ' ').trim();

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates clean linear plain text (ideal for ATS portals & clipboard copy).
 */
export function exportResumeToPlainText(data: ResumeData): string {
  const lines: string[] = [];
  const name = cleanText(data.header.fullName);
  const sub = [cleanText(data.header.degreeTitle), cleanText(data.header.universityCompany)]
    .filter(Boolean)
    .join(' | ');
  const contacts = [
    cleanText(data.header.location),
    cleanText(data.header.email),
    cleanText(data.header.phone),
    ...data.header.links.map((l) => `${cleanText(l.text)} (${l.url})`),
  ].filter(Boolean);

  if (name) lines.push(name);
  if (sub) lines.push(sub);
  if (contacts.length > 0) lines.push(contacts.join(' | '));
  lines.push('');

  data.sections.forEach((sec) => {
    if (sec.hidden) return;
    if (sec.type === 'hr') {
      lines.push('----------------------------------------');
      lines.push('');
      return;
    }
    const title = cleanText(sec.title);
    if (title) lines.push(title.toUpperCase());

    if (sec.type === 'text') {
      lines.push(cleanText((sec as TextSectionData).content));
    } else if (sec.type === 'list') {
      const listSec = sec as ListSectionData;
      listSec.items.forEach((item, idx) => {
        const prefix = listSec.listType === 'numbered' ? `${idx + 1}.` : '-';
        lines.push(`${prefix} ${cleanText(item)}`);
      });
    } else if (sec.type === 'table') {
      const t = sec as TableSectionData;
      if (t.headers && t.headers.length > 0) {
        lines.push(t.headers.map(cleanText).join(' | '));
      }
      t.rows.forEach((row) => {
        lines.push(row.map(cleanText).join(' | '));
      });
    } else if (sec.type === 'entries') {
      (sec as EntriesSectionData).entries.forEach((e) => {
        const top = [cleanText(e.heading), cleanText(e.dateRange)].filter(Boolean).join(' — ');
        const subLine = [cleanText(e.subheading), cleanText(e.location)].filter(Boolean).join(' | ');
        if (top) lines.push(top);
        if (subLine) lines.push(subLine);
        e.bullets.forEach((b) => lines.push(`  • ${cleanText(b)}`));
      });
    } else if (sec.type === 'keyvalue') {
      (sec as KeyValueSectionData).pairs.forEach((p) => {
        lines.push(`${cleanText(p.label)}: ${cleanText(p.value)}`);
      });
    }
    lines.push('');
  });

  if (data.meta.showDeclaration) {
    lines.push('DECLARATION');
    lines.push(cleanText(data.declaration.text));
    const meta = [
      data.declaration.place ? `Place: ${cleanText(data.declaration.place)}` : '',
      data.declaration.date ? `Date: ${cleanText(data.declaration.date)}` : '',
      data.declaration.signature ? `Signature: ${cleanText(data.declaration.signature)}` : '',
    ].filter(Boolean);
    if (meta.length > 0) lines.push(meta.join(' | '));
  }

  return lines.join('\n').trim() + '\n';
}

/**
 * Generates GitHub-flavored Markdown representation of the resume.
 */
export function exportResumeToMarkdown(data: ResumeData): string {
  const lines: string[] = [];
  const name = cleanText(data.header.fullName);
  const sub = [cleanText(data.header.degreeTitle), cleanText(data.header.universityCompany)]
    .filter(Boolean)
    .join(' | ');
  const contacts = [
    cleanText(data.header.location),
    cleanText(data.header.email),
    cleanText(data.header.phone),
    ...data.header.links.map((l) => `[${cleanText(l.text)}](${l.url})`),
  ].filter(Boolean);

  if (name) lines.push(`# ${name}`);
  if (sub) lines.push(`**${sub}**`);
  if (contacts.length > 0) lines.push(contacts.join(' • '));
  lines.push('');

  data.sections.forEach((sec) => {
    if (sec.hidden) return;
    if (sec.type === 'hr') {
      lines.push('---');
      lines.push('');
      return;
    }
    const title = cleanText(sec.title).replace(/:$/, '');
    if (title) lines.push(`## ${title}`);

    if (sec.type === 'text') {
      lines.push(cleanText((sec as TextSectionData).content));
    } else if (sec.type === 'list') {
      const listSec = sec as ListSectionData;
      listSec.items.forEach((item, idx) => {
        const prefix = listSec.listType === 'numbered' ? `${idx + 1}.` : '-';
        lines.push(`${prefix} ${cleanText(item)}`);
      });
    } else if (sec.type === 'table') {
      const t = sec as TableSectionData;
      const colCount = t.headers?.length || t.rows[0]?.length || 0;
      if (colCount > 0) {
        const headers = t.headers ? t.headers.map(cleanText) : Array(colCount).fill('');
        lines.push(`| ${headers.join(' | ')} |`);
        lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
        t.rows.forEach((row) => {
          lines.push(`| ${row.map(cleanText).join(' | ')} |`);
        });
      }
    } else if (sec.type === 'entries') {
      (sec as EntriesSectionData).entries.forEach((e) => {
        lines.push(`### ${cleanText(e.heading)}${e.dateRange ? ` — *${cleanText(e.dateRange)}*` : ''}`);
        const subLine = [cleanText(e.subheading), cleanText(e.location)].filter(Boolean).join(' | ');
        if (subLine) lines.push(`*${subLine}*`);
        e.bullets.forEach((b) => lines.push(`- ${cleanText(b)}`));
        lines.push('');
      });
    } else if (sec.type === 'keyvalue') {
      (sec as KeyValueSectionData).pairs.forEach((p) => {
        lines.push(`- **${cleanText(p.label)}:** ${cleanText(p.value)}`);
      });
    }
    lines.push('');
  });

  if (data.meta.showDeclaration) {
    lines.push('## Declaration');
    lines.push(cleanText(data.declaration.text));
    lines.push('');
    lines.push(
      `**Place:** ${cleanText(data.declaration.place)} | **Date:** ${cleanText(data.declaration.date)} | **Signature:** ${cleanText(data.declaration.signature)}`
    );
  }

  return lines.join('\n').trim() + '\n';
}

/* ── Minimal Stored-ZIP Builder for Real OOXML (.docx) ───────────────── */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildStoredZip(entries: Array<{ path: string; content: string }>): Uint8Array {
  const encoder = new TextEncoder();
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.path);
    const dataBytes = encoder.encode(entry.content);
    const crc = crc32(dataBytes);

    // Local file header (30 bytes + name)
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // UTF-8
    lv.setUint16(8, 0, true); // stored (no compression)
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x5421, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    // Central directory header (46 bytes + name)
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x5421, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);

    localChunks.push(local, dataBytes);
    centralChunks.push(central);
    offset += local.length + dataBytes.length;
  }

  const centralSize = centralChunks.reduce((acc, b) => acc + b.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalSize = offset + centralSize + eocd.length;
  const out = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of [...localChunks, ...centralChunks, eocd]) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  return out;
}

function wPara(
  text: string,
  opts: {
    bold?: boolean;
    italic?: boolean;
    sizeHalfPt?: number;
    spaceAfter?: number;
    borderBottom?: boolean;
    bullet?: boolean;
    colorHex?: string;
    align?: 'left' | 'center' | 'right';
  } = {}
): string {
  const {
    bold = false,
    italic = false,
    sizeHalfPt = 21,
    spaceAfter = 60,
    borderBottom = false,
    bullet = false,
    colorHex,
    align,
  } = opts;
  const display = bullet ? `•  ${text}` : text;
  const indentXml = bullet ? `<w:ind w:left="320" w:hanging="180"/>` : '';
  const alignXml = align ? `<w:jc w:val="${align}"/>` : '';
  const borderXml = borderBottom
    ? `<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="3" w:color="${colorHex || '000000'}"/></w:pBdr>`
    : '';
  const rPr = [
    bold ? '<w:b/>' : '',
    italic ? '<w:i/>' : '',
    `<w:sz w:val="${sizeHalfPt}"/>`,
    colorHex ? `<w:color w:val="${colorHex}"/>` : '',
  ]
    .filter(Boolean)
    .join('');
  return `<w:p><w:pPr><w:spacing w:before="0" w:after="${spaceAfter}"/>${indentXml}${alignXml}${borderXml}</w:pPr><w:r><w:rPr>${rPr}</w:rPr><w:t xml:space="preserve">${escapeXml(display)}</w:t></w:r></w:p>`;
}

/**
 * Builds a valid OOXML `.docx` Blob natively on the client without external dependencies.
 */
export function exportResumeToDocxBlob(data: ResumeData): Blob {
  const bodyBlocks: string[] = [];

  bodyBlocks.push(
    wPara(cleanText(data.header.fullName), { bold: true, sizeHalfPt: 36, spaceAfter: 40 })
  );
  const sub = [cleanText(data.header.degreeTitle), cleanText(data.header.universityCompany)]
    .filter(Boolean)
    .join(' | ');
  if (sub) {
    bodyBlocks.push(wPara(sub, { sizeHalfPt: 21, spaceAfter: 30 }));
  }
  const contacts = [
    cleanText(data.header.location),
    cleanText(data.header.email),
    cleanText(data.header.phone),
    ...data.header.links.map((l) => `${cleanText(l.text)} (${l.url})`),
  ].filter(Boolean);
  if (contacts.length > 0) {
    bodyBlocks.push(
      wPara(contacts.join('  |  '), { sizeHalfPt: 19, spaceAfter: 120, borderBottom: true })
    );
  }

  data.sections.forEach((sec) => {
    if (sec.hidden) return;
    if (sec.type === 'hr') {
      bodyBlocks.push(wPara('', { borderBottom: true, spaceAfter: 80 }));
      return;
    }

    const title = cleanText(sec.title);
    if (title) {
      bodyBlocks.push(
        wPara(title, { bold: true, sizeHalfPt: 24, spaceAfter: 60, borderBottom: true })
      );
    }

    if (sec.type === 'text') {
      bodyBlocks.push(wPara(cleanText((sec as TextSectionData).content), { spaceAfter: 100 }));
    } else if (sec.type === 'list') {
      const listSec = sec as ListSectionData;
      listSec.items.forEach((item, idx) => {
        if (listSec.listType === 'numbered') {
          bodyBlocks.push(wPara(`${idx + 1}. ${cleanText(item)}`, { spaceAfter: 40 }));
        } else {
          bodyBlocks.push(wPara(cleanText(item), { bullet: true, spaceAfter: 40 }));
        }
      });
    } else if (sec.type === 'table') {
      const t = sec as TableSectionData;
      const rowsXml: string[] = [];
      if (t.headers && t.headers.length > 0) {
        const cells = t.headers
          .map(
            (h) =>
              `<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="E5E7EB"/></w:tcPr>${wPara(cleanText(h), { bold: true, sizeHalfPt: 20, spaceAfter: 20 })}</w:tc>`
          )
          .join('');
        rowsXml.push(`<w:tr>${cells}</w:tr>`);
      }
      t.rows.forEach((row) => {
        const cells = row
          .map(
            (cell) =>
              `<w:tc>${wPara(cleanText(cell), { sizeHalfPt: 20, spaceAfter: 20 })}</w:tc>`
          )
          .join('');
        rowsXml.push(`<w:tr>${cells}</w:tr>`);
      });
      bodyBlocks.push(
        `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="999999"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="999999"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/></w:tblBorders></w:tblPr>${rowsXml.join('')}</w:tbl>`
      );
      bodyBlocks.push(wPara('', { spaceAfter: 60 }));
    } else if (sec.type === 'entries') {
      (sec as EntriesSectionData).entries.forEach((entry) => {
        const titleLine = [cleanText(entry.heading), cleanText(entry.dateRange)]
          .filter(Boolean)
          .join('  —  ');
        const subLine = [cleanText(entry.subheading), cleanText(entry.location)]
          .filter(Boolean)
          .join('  |  ');
        if (titleLine) bodyBlocks.push(wPara(titleLine, { bold: true, spaceAfter: 20 }));
        if (subLine) bodyBlocks.push(wPara(subLine, { italic: true, sizeHalfPt: 19, spaceAfter: 30 }));
        entry.bullets.forEach((b) => bodyBlocks.push(wPara(cleanText(b), { bullet: true, spaceAfter: 30 })));
      });
    } else if (sec.type === 'keyvalue') {
      (sec as KeyValueSectionData).pairs.forEach((pair) => {
        bodyBlocks.push(
          wPara(`${cleanText(pair.label)}: ${cleanText(pair.value)}`, { spaceAfter: 40 })
        );
      });
    }
  });

  if (data.meta.showDeclaration) {
    bodyBlocks.push(wPara('Declaration', { bold: true, sizeHalfPt: 22, spaceAfter: 40 }));
    bodyBlocks.push(wPara(cleanText(data.declaration.text), { sizeHalfPt: 20, spaceAfter: 60 }));
    bodyBlocks.push(
      wPara(
        `Place: ${cleanText(data.declaration.place)}    Date: ${cleanText(data.declaration.date)}    Signature: ${cleanText(data.declaration.signature)}`,
        { sizeHalfPt: 20, spaceAfter: 40 }
      )
    );
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyBlocks.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="720" w:right="850" w:bottom="720" w:left="850"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const zipBytes = buildStoredZip([
    { path: '[Content_Types].xml', content: contentTypesXml },
    { path: '_rels/.rels', content: relsXml },
    { path: 'word/document.xml', content: documentXml },
  ]);

  const copy = new Uint8Array(zipBytes.byteLength);
  copy.set(zipBytes);
  return new Blob([copy.buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
