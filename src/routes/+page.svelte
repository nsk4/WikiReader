<script lang="ts">
    import type { WikiSection } from '$lib/wikipedia/WikiSection';
    import WikiSectionDisplay from '$lib/components/WikiSectionDisplay.svelte';

    import { extractTitleFromUrl, fetchArticle } from '$lib/wikipedia/wiki';
    import { parseWikipediaHtml, flattenWikiSections } from '$lib/wikipedia/parser';
    import { TTSSectionPlayer } from '$lib/ttsManager';

    let wikiUrl = '';
    let statusText = ''; // ERROR
    let sections: WikiSection[];
    let ttsPlayer: TTSSectionPlayer | null = null;
    let readFullArticle = false;

    async function handleFetchArticle() {
        statusText = '';
        const title = extractTitleFromUrl(wikiUrl);
        if (!title) {
            statusText = '⚠️ Invalid Wikipedia URL';
            return;
        }

        try {
            const htmlArticle = await fetchArticle(title);
            sections = await parseWikipediaHtml(htmlArticle);
        } catch (e) {
            statusText = `❌ Error: ${(e as Error).message}`;
        }
    }

    async function read() {
        const textSections = flattenWikiSections(readFullArticle ? sections : [sections[0]]);
        ttsPlayer = new TTSSectionPlayer(textSections);
        ttsPlayer.start();
    }

    async function testTTS() {
        const textSections = [
            'This is a test section 1.',
            'This is a test section 2.',
            'This is a test section 3.'
        ];
        ttsPlayer = new TTSSectionPlayer(textSections);
        ttsPlayer.start();
    }

    function stopReading() {
        if (ttsPlayer) {
            ttsPlayer.stop();
        }
    }
</script>

<button on:click={testTTS}>Test TTS</button>
<div>
    <input bind:value={wikiUrl} placeholder="Paste Wikipedia URL" />
    <button on:click={handleFetchArticle}>Fetch Article</button>
    {statusText}
</div>

<div>
    <label><input type="checkbox" bind:checked={readFullArticle} />Read full article</label>
    <button on:click={read}>Read</button>
    <button on:click={stopReading}>Stop Reading</button>
</div>

<div class="sections">
    {#each sections as section}
        <WikiSectionDisplay {section} />
        <hr />
    {/each}
</div>

<style>
    .sections {
        border: 1px solid #ccc;
    }
</style>
