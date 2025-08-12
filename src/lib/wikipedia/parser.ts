import type WikiSection from "./WikiSection";

/**
 * Parses the HTML content returned by Wikipedia REST API.
 * @param html - Raw HTML string from the Wikipedia API.
 */
export function parseWikipediaHtml(html: string): WikiSection[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const body = doc.querySelector('body');
  if (!body) return [];

  const topSections = Array.from(body.children).filter(
    el => el.tagName.toLowerCase() === 'section'
  );

  return topSections.map(section => parseSection(section, 2)); // h2 for top-level
}

function parseSection(sectionEl: Element, expectedHeadingLevel: number): WikiSection {
  const headingTag = `h${expectedHeadingLevel}`;
  const headingEl = sectionEl.querySelector(headingTag);
  const heading = headingEl?.textContent?.trim() ?? "Introduction";

  // Extract top-level paragraphs (not nested)
  const paragraphs = Array.from(sectionEl.children)
    .filter(el => el.tagName.toLowerCase() === 'p')
    .map(p => p.textContent?.trim() || '')
    .filter(Boolean);

  // Extract subsections
  const subsections = Array.from(sectionEl.children)
    .filter(el => el.tagName.toLowerCase() === 'section')
    .map(sub => parseSection(sub, expectedHeadingLevel + 1));

  return {
    heading,
    level: expectedHeadingLevel,
    paragraphs,
    subsections
  };
}

export function flattenWikiSections(
  sections: WikiSection[],
  options?: {
    headingPrefix?: (level: number) => string;
    indent?: (level: number) => string;
  }
): string[] {
  return sections
    .map(section => flattenSingleSection(section, options));
}

function flattenSingleSection(
  section: WikiSection,
  options?: {
    headingPrefix?: (level: number) => string;
    indent?: (level: number) => string;
  }
): string {
  const {
    headingPrefix = () => '',
    indent = () => '',
  } = options || {};

  const parts: string[] = [];

  if (section.heading) {
    const prefix = headingPrefix(section.level);
    const pad = indent(section.level);
    parts.push(`${pad}${prefix}${section.heading}`);
  }

  for (const para of section.paragraphs) {
    const pad = indent(section.level);
    parts.push(`${pad}${para}`);
  }

  for (const sub of section.subsections) {
    parts.push(flattenSingleSection(sub, options));
  }

  return parts.join('\n\n');
}