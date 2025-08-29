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
    link={{ href: 'https://github.com/nsk4/WikiReader', text: 'GitHub' }}
/>

<slot />

<StatusBar {status} />

<SiteFooter
    owner="Nejc Smrkolj Koželj"
    year={new Date().getFullYear()}
    version="MVP-1.0.0"
    licenseHref="https://github.com/nsk4/WikiReader/blob/main/LICENSE"
    repoHref="https://github.com/nsk4/WikiReader"
    bugHref="https://github.com/nsk4/WikiReader/issues/new?labels=bug"
/>
