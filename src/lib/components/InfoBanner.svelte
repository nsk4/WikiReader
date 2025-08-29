<script lang="ts">
    export let label = 'INFO';
    export let message = 'Preview build.';
    export let link: { href: string; text: string } | null = null;
</script>

<div class="banner" role="note" aria-live="polite">
    <div class="banner-inner">
        <div class="field-row">
            <span class="badge">{label}</span>
            <span>{message}</span>
        </div>
        {#if link}
            <a
                class="btn btn-ghost"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={'Open ' + link.text}
            >
                {link.text}
            </a>
        {/if}
    </div>
</div>
