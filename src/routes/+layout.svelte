<script lang="ts">
    import { onMount } from 'svelte';
    import InfoBanner from '$lib/components/InfoBanner.svelte';
    import StatusBar, { type StatusLevel } from '$lib/components/StatusBar.svelte';
    import '../app.css';

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
