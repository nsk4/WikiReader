<script lang="ts">
    import type { WikiSection } from '$lib/wikipedia/WikiSection';
    import ArticleTreeSection from './ArticleTreeSection.svelte';

    export let section: WikiSection;
    export let depth;
    export let playing = false;
    export let collapsible = true;

    let isCollapsed = false;
    const toggle = () => {
        if (!collapsible) return;
        isCollapsed = !isCollapsed;
    };

    const pad = Math.min(depth * 14, 56);
</script>

<div class="section {playing ? 'playing' : ''}">
    <div class="section-header" style="padding-left:{pad}px">
        {#if collapsible}
            <button
                class="icon-btn"
                aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                aria-pressed={isCollapsed ? 'true' : 'false'}
                on:click={toggle}
            >
                {#if isCollapsed}＋{:else}－{/if}
            </button>
        {/if}

        {#if playing}<span class="play-dot" title="Currently playing"></span>{/if}
        <div class="section-title">{section.heading}</div>
    </div>

    {#if !isCollapsed}
        <div class="section-body" style="padding-left:{pad + 16}px">
            {#each section.paragraphs as paragraph}
                <p>{paragraph}</p>
            {/each}

            {#if section.subsections?.length}
                <div class="subsections">
                    {#each section.subsections as subsection}
                        <div class="mt-8">
                            <ArticleTreeSection section={subsection} depth={depth + 1} />
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>
