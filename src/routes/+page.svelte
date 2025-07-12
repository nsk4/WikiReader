<script lang="ts">
  let wikiUrl = '';
  let status = '';
  
  function extractTitle(url: string): string | null {
    const match = url.match(/\/wiki\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  async function fetchArticleText(title: string): Promise<string> {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=extracts&explaintext=true&format=json&titles=${encodeURIComponent(title)}`
    );
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    return page.extract || '';
  }

  async function handleRead() {
    status = '';
    const title = extractTitle(wikiUrl);
    if (!title) {
      status = '⚠️ Invalid Wikipedia URL';
      return;
    }

    const text = await fetchArticleText(title);
    if (!text) {
      status = '❌ Article not found or empty';
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    status = '🔊 Reading started...';
  }
</script>

<h1>WikiReader</h1>
<input bind:value={wikiUrl} placeholder="Paste Wikipedia URL" />
<button on:click={handleRead}>Read Article</button>
<p>{status}</p>