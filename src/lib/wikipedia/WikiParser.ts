import type { WikiSection } from './WikiSection';

const headingSuffix = '!!'; // Emphasize headings for TTS

export function getWikipediaArticle(url: string): Promise<WikiSection[]> {
    return fetchArticle(url).then((html) => cleanWikiSections(parseHtml(html)));
}

function fetchArticle(url: string): Promise<string> {
    const match = url.match(/\/wiki\/(.+)$/);
    if (!match) {
        return Promise.reject(new Error('Invalid Wikipedia URL'));
    }
    return fetch(
        `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(match[1])}`
    ).then((res) => {
        if (!res.ok) {
            throw new Error(
                'Failed to fetch article from Wikipedia. Error: ' +
                    res.status +
                    ' ' +
                    res.statusText
            );
        }
        return res.text();
    });
}

/**
 * Parses the HTML content returned by Wikipedia REST API.
 * @param html - Raw HTML string from the Wikipedia API.
 */
function parseHtml(html: string): WikiSection[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const body = doc.querySelector('body');
    if (!body) return [];

    const topSections = Array.from(body.children).filter(
        (el) => el.tagName.toLowerCase() === 'section'
    );

    return topSections.map((section) => parseSection(section, 2)); // h2 for top-level
}

function parseSection(sectionEl: Element, expectedHeadingLevel: number): WikiSection {
    const headingTag = `h${expectedHeadingLevel}`;
    const headingEl = sectionEl.querySelector(headingTag);
    const heading = headingEl?.textContent?.trim() ?? 'Introduction';

    // Extract paragraphs and lists (top-level only)
    const paragraphs = Array.from(sectionEl.children).flatMap((el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === 'p') {
            const text = el.textContent?.trim();
            return text ? [text] : [];
        }
        if (tag === 'dl') {
            // Handle description lists by joining dt and dd pairs
            const items = Array.from(el.children);
            const texts: string[] = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.tagName.toLowerCase() === 'dt') {
                    const dtText = item.textContent?.trim();
                    const ddText =
                        i + 1 < items.length && items[i + 1].tagName.toLowerCase() === 'dd'
                            ? items[i + 1].textContent?.trim()
                            : '';
                    if (dtText) {
                        texts.push(ddText ? `${dtText}: ${ddText}` : dtText);
                    }
                }
            }
            return texts;
        }
        if (tag === 'ul' || tag === 'ol') {
            const items = Array.from(el.children)
                .filter((li) => li.tagName.toLowerCase() === 'li')
                .map((li) => li.textContent?.trim() || '')
                .filter(Boolean);

            if (items.length === 0) return [];
            return [items.join('; ')];
        }
        return [];
    });

    // Extract subsections
    const subsections = Array.from(sectionEl.children)
        .filter((el) => el.tagName.toLowerCase() === 'section')
        .map((sub) => parseSection(sub, expectedHeadingLevel + 1));

    return {
        heading,
        paragraphs,
        subsections
    };
}

/**
 * Cleans a WikiSection tree:
 * - Strips references from paragraph text
 * - Removes empty or nearly-empty sections
 */
function cleanWikiSections(sections: WikiSection[]): WikiSection[] {
    return sections
        .map((section) => cleanWikiSection(section))
        .filter((section) => section !== null) as WikiSection[];
}

function cleanWikiSection(section: WikiSection): WikiSection | null {
    const MIN_PARAGRAPH_CHAR_LENGTH = 50; // Minimum length for a paragraph to be considered valid
    let paragraphs = section.paragraphs;

    // Strip references
    paragraphs = paragraphs.map((p) =>
        p
            .replace(/\[\d+\]/g, '') // e.g. [1]
            .replace(/\[citation needed\]/gi, '') // remove citation markers
            .replace(/\[\w+\]/g, '') // optional: remove other [x] tags
            .trim()
    );

    const cleanedSubsections = section.subsections
        .map((sub) => cleanWikiSection(sub))
        .filter((sub) => sub !== null) as WikiSection[];

    // Check if the section is empty
    if (paragraphs.length === 0 && cleanedSubsections.length === 0) {
        return null;
    }

    // Check if the section is too short
    const totalTextLength = paragraphs.reduce((acc, p) => acc + p.length, 0);
    if (totalTextLength < MIN_PARAGRAPH_CHAR_LENGTH && cleanedSubsections.length === 0) {
        return null;
    }

    return {
        ...section,
        paragraphs,
        subsections: cleanedSubsections
    };
}

export function flattenWikipediaSection(section: WikiSection): string {
    const parts: string[] = [];

    if (section.heading) {
        // TODO: Experiment to see what works best for emphasizing headings with TTS
        parts.push(`${section.heading.toUpperCase()}${headingSuffix}`); // Emphasize headings for TTS
    }

    for (const para of section.paragraphs) {
        parts.push(`${para}`);
    }

    for (const sub of section.subsections) {
        parts.push(flattenWikipediaSection(sub));
    }

    return parts.join('\n\n');
}
