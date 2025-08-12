<script lang="ts">
  import { extractTitleFromUrl, fetchArticle } from '$lib/wikipedia/wiki';
  import { parseWikipediaHtml, flattenWikiSections } from '$lib/wikipedia/parser';
  import type WikiSection from '$lib/wikipedia/WikiSection';
  import { TTSSectionPlayer } from '$lib/ttsManager';

  let ttsType = 'default';
  let wikiUrl = '';
  let articleText = '';
  let readFullArticle = false;
  let textSections: string[] = [];
  let ttsPlayer: TTSSectionPlayer | null = null;

  async function readTestWithChunks() {
    let player = new TTSSectionPlayer(["paragraph 1","paragraph 2","paragraph 3"]);
    player.start();
  }

  async function readWithOpenAi(textSections: string[]) { 
    ttsPlayer = new TTSSectionPlayer(textSections);
    ttsPlayer.start();
  }
  
  function readWithBrowserTTS(textSections: string[]) {
    const text = textSections.join('\n\n');
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  function stopRead() {
    if(speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    if (ttsPlayer) {
      ttsPlayer.stop();
    }
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

      // TODO: Rework this to query individual subsection chunks instead of only major sections
      textSections = flattenWikiSections(selectedArticle, {
        headingPrefix: level => '#'.repeat(level) + ' ',
        indent: () => '',
      });
      articleText = textSections.join('\n\n');
    } catch (e) {
      articleText = `❌ Error: ${(e as Error).message}`;
    }
  }

  async function readText() {
    switch (ttsType) {
      case 'openai':
        await readWithOpenAi(textSections);
        break;
      default:
        readWithBrowserTTS(textSections);
    }
  }
</script>

<!-- TODO: Split article parsing from text area input testing -->

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

<textarea bind:value={articleText} placeholder="Paste Text"  on:change={(event)=> { 
  console.log(event?.target?.value);
  textSections=[event?.target?.value || '']; 
  }}></textarea>
<button on:click={readText}>Read Text</button>
<button on:click={stopRead}>Stop Reading</button>

<br />

<button on:click={readTestWithChunks}>Read with Chunks</button>