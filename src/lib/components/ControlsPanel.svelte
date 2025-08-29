<script lang="ts">
    import { Engine } from '$lib/ui/engine';

    // Controls (modified via this component and should be binded to parent)
    export let engine: Engine = Engine.BROWSER;
    export let wikiUrl = '';
    export let introOnly = true;
    export let passphrase = ''; // Temporary passphrase for OpenAI API access

    // Status (passed from parent)
    export let isFetching = false;
    export let canStart = false;
    export let isPlaying = false;
    export let fetchError: string | null = null;

    // Event handlers (passed from parent)
    export let onFetch: (() => void) | null = null;
    export let onStart: (() => void) | null = null;
    export let onStop: (() => void) | null = null;

    const setEngine = (val: Engine) => (engine = val);
</script>

<div class="panel" style="padding:16px;">
    <div class="stack">
        <div class="h2">Playback options</div>

        <!-- Engine -->
        <div class="field">
            <label class="h2" for="tts-engine">TTS Engine</label>
            <div class="field-row" id="tts-engine" role="radiogroup" aria-label="TTS Engine">
                <label class="choice">
                    <input
                        type="radio"
                        name="engine"
                        value="browser"
                        checked={engine === Engine.BROWSER}
                        on:change={() => setEngine(Engine.BROWSER)}
                    />
                    Browser TTS
                </label>
                <label class="choice">
                    <input
                        type="radio"
                        name="engine"
                        value="openai"
                        checked={engine === Engine.OPENAI}
                        on:change={() => setEngine(Engine.OPENAI)}
                    />
                    OpenAI TTS
                </label>
            </div>
            <div class="helper">
                Browser TTS starts instantly; OpenAI TTS offers higher quality.
            </div>
        </div>

        <!-- OpenAI TTS passphrase -->
        {#if engine === 'openai'}
            <div class="field">
                <label class="h2" for="tts-pass">Passphrase</label>
                <input
                    id="tts-pass"
                    class="input"
                    type="password"
                    placeholder="Enter demo passphrase"
                    bind:value={passphrase}
                    autocomplete="off"
                />
                <div class="helper">Required only for OpenAI TTS.</div>
            </div>
        {/if}

        <!-- URL + fetch -->
        <div class="field">
            <label class="h2" for="wiki-url">Wikipedia link</label>
            <input
                id="wiki-url"
                class="input"
                type="url"
                placeholder="https://en.wikipedia.org/wiki/Your_topic"
                bind:value={wikiUrl}
                aria-invalid={fetchError ? 'true' : 'false'}
            />
            {#if fetchError}<div class="error">{fetchError}</div>{/if}
            <div class="field-row mt-8">
                <button class="btn btn-primary" on:click={() => onFetch?.()} disabled={isFetching}>
                    {#if isFetching}⏳ Fetching…{/if}{#if !isFetching}Fetch Article{/if}
                </button>
            </div>
        </div>

        <!-- Intro / Full -->
        <div class="field">
            <label class="choice" for="intro-only">
                <input id="intro-only" type="checkbox" bind:checked={introOnly} />
                Read introduction only
            </label>
            <div class="helper">Uncheck to read the entire article.</div>
        </div>

        <!-- Playback -->
        <div class="field-row">
            <button
                class="btn btn-primary"
                on:click={() => onStart?.()}
                disabled={!canStart || isFetching || isPlaying}
            >
                ▶ Start
            </button>
            <button class="btn btn-danger" on:click={() => onStop?.()} disabled={!isPlaying}>
                ■ Stop
            </button>
        </div>
    </div>
</div>
