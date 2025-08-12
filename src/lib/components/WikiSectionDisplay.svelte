<script lang="ts">
    import type WikiSection from '$lib/wikipedia/WikiSection';
    import WikiSectionDisplay from './WikiSectionDisplay.svelte';
    export let section: WikiSection;
</script>

<section>
    <h1>{section.heading}</h1>
    {#each section.paragraphs as paragraph}
        <p>{paragraph}</p>
    {/each}
    {#if section.subsections.length > 0}
        <div class="subsections">
            {#each section.subsections as subsection}
                <WikiSectionDisplay section={subsection} />
            {/each}
        </div>
    {/if}
</section>
