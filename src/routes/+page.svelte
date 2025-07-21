<script lang="ts">
  import { extractTitleFromUrl, fetchArticle } from '$lib/wikipedia/wiki';
  import { parseWikipediaHtml, flattenWikiSections, type WikiSection } from '$lib/wikipedia/parser';



  let ttsType = 'default';
  let wikiUrl = '';
  let articleText = '';
  let status = '';
  let readFullArticle = false;

  async function readWithOpenAi(text: string) {
    const res = await fetch('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      alert('TTS request failed');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    new Audio(url).play();
  }
  
  function readWithBrowserTTS(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  async function handleUrlFetch() {
    articleText = '';
    const title = extractTitleFromUrl(wikiUrl);
    if (!title) {
      articleText = '⚠️ Invalid Wikipedia URL';
      return;
    }

    try {
      const htmlArticle = await fetchArticle(title);
      const parsedArticle = await parseWikipediaHtml(htmlArticle);

      let selectedArticle: WikiSection[];
      if(readFullArticle) {
        selectedArticle = parsedArticle;
      }
      else {
        selectedArticle = [parsedArticle[0]];
      }

      articleText = flattenWikiSections(selectedArticle, {
        headingPrefix: level => '#'.repeat(level) + ' ',
        indent: () => '',
      });
    } catch (e) {
      articleText = `❌ Error: ${(e as Error).message}`;
    }
    
  }

  async function readText(text: string) {
    switch (ttsType) {
      case 'openai':
        await readWithOpenAi(text);
        break;
      default:
        readWithBrowserTTS(text);
    }
    status = '🔊 Reading started...';
  }
</script>


<h1>WikiReader</h1>
<select bind:value={ttsType}>
  <option value="default" selected>Browser</option>
  <option value="openai">Open AI</option>
</select>

<br />

<input bind:value={wikiUrl} placeholder="Paste Wikipedia URL" />
<label><input type="checkbox" bind:checked={readFullArticle} />Read full article</label>
<button on:click={handleUrlFetch}>Fetch Article</button>

<br />

<textarea bind:value={articleText} placeholder="Paste Text"></textarea>
<button on:click={() => readText(articleText)}>Read Text</button>
<p>{status}</p>
