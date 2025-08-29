<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import InfoBanner from '$lib/components/InfoBanner.svelte';
    import StatusBar, { type StatusLevel } from '$lib/components/StatusBar.svelte';
    import SiteFooter from '$lib/components/SiteFooter.svelte';

    let status: { level: StatusLevel; message: string } = { level: 'ok', message: 'Ready.' };

    onMount(() => window.addEventListener('wikireader-status', (e: any) => (status = e.detail)));
</script>

<InfoBanner
    label="MVP"
    message="Early MVP: expect rough edges; feedback welcome!"
    link={{ href: 'https://github.com/yourrepo', text: 'GitHub' }}
/>

<slot />

<StatusBar {status} />

<SiteFooter
    licenseHref="https://github.com/yourrepo/blob/main/LICENSE"
    repoHref="https://github.com/yourrepo"
    bugHref="https://github.com/yourrepo/issues/new?labels=bug"
/>
