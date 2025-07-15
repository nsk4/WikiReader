export function extractTitleFromUrl(url: string): string | null {
  const match = url.match(/\/wiki\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function fetchArticle(title: string): Promise<string> {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`
  );
  if (!res.ok) 
  {
    throw new Error('Failed to fetch intro');
  }
  const data = await res.text();
  return data;
}