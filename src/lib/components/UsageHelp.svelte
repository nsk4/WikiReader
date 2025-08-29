<script lang="ts">
    export let compact = false;
</script>

<div class="card">
    <h3 class="h2">How to use</h3>
    <ol class="p" style="margin: 0; padding-left: 18px; display: grid; gap: 6px;">
        <li>Paste a Wikipedia link.</li>
        <li>Fetch the article.</li>
        <li>Choose TTS engine (Browser or OpenAI).</li>
        <li>Uncheck "Read introduction only" to read the full article.</li>
        <li>Press Start to listen; Stop to halt.</li>
    </ol>
    {#if !compact}
        <p class="helper mt-8">MVP: minimal settings; section highlight shows what’s being read.</p>
    {/if}
</div>
