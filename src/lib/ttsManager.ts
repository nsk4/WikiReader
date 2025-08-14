interface TTSSection {
    text: string;
    audioLoaded: boolean;
    audioLoading: boolean;
    audioPromise: Promise<Blob>;
}

export class TTSSectionPlayer {
    private queue: TTSSection[];
    private isPlaying;
    private abortController: AbortController;
    private audio = new Audio();

    constructor(sections: String[]) {
        this.queue = sections.map((section) => {
            return {
                text: section,
                audioLoaded: false,
                audioLoading: false,
                audioPromise: new Promise<Blob>(() => {})
            } as TTSSection;
        });
        this.isPlaying = false;
        this.abortController = new AbortController();
    }

    public start() {
        if (this.queue.length === 0) {
            return;
        }

        // Start fetching TTS for all sections
        console.log('Starting TTS playback for sections:', this.queue.length);
        this.queue.forEach((section) => {
            section.audioPromise = this.fetchTTS(section);
        });

        this.play();
    }

    private async play() {
        console.log('Sections to play: ', this.queue.length);
        this.isPlaying = true;
        for (let i = 0; i < this.queue.length; i++) {
            console.log('Chunk playing:', i);
            // TODO: audio loading could fail
            const audioBlob = await this.queue[i].audioPromise;
            await this.playAudioBlob(audioBlob);
            console.log('Chunk played:', i);
        }
        this.isPlaying = false;
    }

    private playAudioBlob(blob: Blob): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.audio.paused) {
                console.log('Stopping current audio playback');
                this.audio.pause();
                this.audio.currentTime = 0;
            }
            this.audio.src = URL.createObjectURL(blob);
            this.audio.onended = () => resolve();
            this.audio.onerror = () => reject(new Error('Audio playback failed'));
            this.audio.play().catch(reject); // Catch play() errors (e.g., autoplay policy)
        });
    }

    private async fetchTTS(section: TTSSection): Promise<Blob> {
        if (section.audioLoaded) {
            console.log('Audio already loaded for section: ', section.text);
            return section.audioPromise;
        }

        if (section.audioLoading) {
            console.log('Audio already loading for section: ', section.text);
            return section.audioPromise;
        }

        section.audioLoaded = false;
        section.audioLoading = true;
        try {
            if (this.getFromCache(section)) {
                return section.audioPromise;
            }

            console.log('Requesting TTS for section:', section.text);
            const response = await fetch('/api/tts', {
                method: 'POST',
                signal: this.abortController.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: section.text })
            });
            if (!response.ok) {
                throw new Error(`TTS request failed: ${response.status} ${response.statusText}`);
            }

            section.audioPromise = response.blob();
            await section.audioPromise;

            section.audioLoaded = true;
            console.log('TTS fetched for section:', section.text);
        } catch (error) {
            console.error('Error prefetching TTS:', section.text, error);
            section.audioLoaded = false;
        } finally {
            section.audioLoading = false;
        }

        this.storeToCache(section);

        return section.audioPromise;
    }

    // TODO: For debugging purposes to reduce OpenAI token usage, remove in production
    private async storeToCache(section: TTSSection) {
        const base64 = btoa(
            String.fromCharCode(...new Uint8Array(await (await section.audioPromise).arrayBuffer()))
        );
        localStorage.setItem('blob_' + section.text, base64);
    }

    // TODO: For debugging purposes to reduce OpenAI token usage, remove in production
    private getFromCache(section: TTSSection): boolean {
        const base64 = localStorage.getItem('blob_' + section.text);
        if (!base64) {
            return false;
        }
        console.log('Using cached TTS for section:', section.text);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        section.audioPromise = Promise.resolve(new Blob([bytes]));
        section.audioLoaded = true;
        console.log('TTS fetched for section:', section.text);
        return true;
    }

    public stop() {
        this.abortController.abort();
        this.audio.pause();
        this.isPlaying = false;
    }
}
