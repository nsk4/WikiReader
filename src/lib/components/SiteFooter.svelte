<script lang="ts">
    export let owner = 'yourname';
    export let year = new Date().getFullYear();
    export let version: string | null = null;
    export let licenseHref = 'https://github.com/yourrepo/blob/main/LICENSE';
    export let repoHref = 'https://github.com/yourrepo';
    export let bugHref = 'https://github.com/yourrepo/issues/new?labels=bug';
</script>

<div class="site-footer">
    <div class="site-footer-inner">
        <p>
            &copy; {year}
            {owner}. All rights reserved. (<a
                href={licenseHref}
                target="_blank"
                rel="noopener noreferrer">MIT License</a
            >)
        </p>
        <nav class="footer-links">
            <a href={repoHref} target="_blank" rel="noopener noreferrer">GitHub</a>
            <span aria-hidden="true">·</span>
            <a href={bugHref} target="_blank" rel="noopener noreferrer">Report a bug</a>
            {#if version}
                <span aria-hidden="true">·</span>
                <span title="Deployment version">v{version}</span>
            {/if}
        </nav>
    </div>
</div>
