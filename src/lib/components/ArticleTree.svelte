<script lang="ts">
    import type { WikiSection } from '$lib/wikipedia/WikiSection';
    import ArticleTreeSection from './ArticleTreeSection.svelte';

    export let sections: WikiSection[] = [];
    export let currentPlayingIndex: number | null = null; // highlight currently playing section
</script>

<div class="panel" style="padding:16px;">
    <div class="h2 mb-8">Article</div>

    {#if !sections?.length}
        <div class="helper">No article loaded yet.</div>
    {:else}
        <div class="sections">
            {#each sections as section, index}
                <ArticleTreeSection {section} depth={0} playing={index === currentPlayingIndex} />
                <hr />
            {/each}
        </div>
    {/if}
</div>
