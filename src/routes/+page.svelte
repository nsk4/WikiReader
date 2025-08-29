<script lang="ts">
    import ControlsPanel from '$lib/components/ControlsPanel.svelte';
    import ArticleTree from '$lib/components/ArticleTree.svelte';
    import { type WikiSection } from '$lib/wikipedia/WikiSection';
    import { StatusLevel } from '$lib/ui/status';
    import { StatusEvent } from '$lib/ui/StatusEvent';
    import { flattenWikipediaSection, getWikipediaArticle } from '$lib/wikipedia/WikiParser';
    import { TtsSectionPlayer } from '$lib/TtsSectionPlayer';
    import { Engine } from '$lib/ui/engine';
    import UsageHelp from '$lib/components/UsageHelp.svelte';

    // Controls
    let engine: Engine = Engine.BROWSER;
    let wikiUrl = '';
    let introOnly = true;
    let passphrase = '';

    // Status
    let isFetching = false;
    let isPlaying = false;
    let canStart = false;
    let fetchError: string | null = null;

    // Article data
    let sections: WikiSection[] = [];
    let currentPlayingIndex: number | null = null;

    // TTS player instance
    let ttsPlayer: TtsSectionPlayer | null = null;

    // Set status text in layout via event
    function setStatus(level: StatusLevel, message: string) {
        window.dispatchEvent(new StatusEvent(level, message));
    }

    async function handleFetch() {
        handleStop(); // stop any ongoing playback
        try {
            setStatus(StatusLevel.LOADING, 'Fetching and parsing article…');
            fetchError = null;
            canStart = false;
            isFetching = true;
            sections = await getWikipediaArticle(wikiUrl);
            canStart = sections.length > 0;
            if (canStart) {
                setStatus(StatusLevel.OK, 'Article fetched. Ready to play.');
            } else {
                setStatus(StatusLevel.WARN, 'No content found.');
            }
        } catch (e) {
            fetchError = (e as Error).message;
            setStatus(StatusLevel.ERR, (e as Error).message);
        } finally {
            isFetching = false;
        }
    }

    function handleStart() {
        if (!sections.length) {
            // TODO: should there not be a guard in ControlsPanel?
            return;
        }
        isPlaying = true;
        setStatus(StatusLevel.PLAYING, 'Reading…');

        const textSections = introOnly
            ? [flattenWikipediaSection(sections[0])]
            : sections.map((section) => flattenWikipediaSection(section));
        switch (engine) {
            case Engine.OPENAI:
                ttsPlayer = new TtsSectionPlayer(textSections, passphrase);
                ttsPlayer.onSectionStart = (index) => {
                    currentPlayingIndex = index;
                };
                ttsPlayer.onError = (error) => {
                    setStatus(StatusLevel.ERR, error);
                    currentPlayingIndex = null;
                    isPlaying = false;
                };
                ttsPlayer.onStop = () => {
                    setStatus(StatusLevel.WARN, 'Stopped.');
                    currentPlayingIndex = null;
                    isPlaying = false;
                };
                ttsPlayer.onEnd = () => {
                    setStatus(StatusLevel.OK, 'Finished.');
                    currentPlayingIndex = null;
                    isPlaying = false;
                };
                ttsPlayer.start();
                break;
            default:
                const utterance = new SpeechSynthesisUtterance(textSections.join('\n\n'));
                utterance.onerror = () => {
                    setStatus(StatusLevel.WARN, 'Stopped.');
                    isPlaying = false;
                };
                utterance.onend = () => {
                    setStatus(StatusLevel.OK, 'Finished.');
                    isPlaying = false;
                };

                speechSynthesis.cancel();
                speechSynthesis.speak(utterance);
        }
    }

    function handleStop() {
        speechSynthesis?.cancel();
        ttsPlayer?.stop();
    }
</script>

<div class="container" style="padding-top:14px;padding-bottom:70px;">
    <div class="mb-16">
        <h1 class="h1">WikiReader <span class="badge">MVP</span></h1>
        <p class="p">Turn Wikipedia into audio. Paste a link, choose TTS, and hit Start.</p>
    </div>

    <div class="grid">
        <div class="stack">
            <UsageHelp compact={false} />

            <ControlsPanel
                bind:engine
                bind:wikiUrl
                bind:introOnly
                bind:passphrase
                {isFetching}
                {isPlaying}
                {fetchError}
                {canStart}
                onFetch={handleFetch}
                onStart={handleStart}
                onStop={handleStop}
            />
        </div>

        <ArticleTree {sections} {currentPlayingIndex} />
    </div>
</div>
