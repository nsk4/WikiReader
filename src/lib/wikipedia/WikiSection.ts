export interface WikiSection {
    heading: string;
    paragraphs: string[];
    subsections: WikiSection[];
}
