export default interface WikiSection {
  heading: string;
  level: number;
  paragraphs: string[];
  subsections: WikiSection[];
}