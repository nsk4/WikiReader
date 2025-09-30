interface TTSSection {
    text: string;
    audioLoaded: boolean;
    audioLoading: boolean;
    audioPromise: Promise<Blob>;
}

// Manages TTS playback for multiple sections
export class TtsSectionPlayer {
    private queue: TTSSection[];
    private isPlaying;
    private abortController: AbortController;
    private apiKey: string;
    private audio = new Audio();
    public onStart: (() => void) | null = null;
    public onSectionStart: ((position: number, section: string) => void) | null = null;
    public onSectionEnd: ((position: number, section: string) => void) | null = null;
    public onEnd: (() => void) | null = null;
    public onStop: (() => void) | null = null;
    public onError: ((error: string) => void) | null = null;

    constructor(sections: string[], apiKey: string) {
        this.apiKey = apiKey.trim();
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
        if (!this.apiKey) {
            console.error('OpenAI API key missing for TTS playback');
            this.onError?.('OpenAI API key missing.');
            return;
        }
        if (this.queue.length === 0) {
            console.error('No sections to play');
            this.onError?.('No sections to play');
            return;
        }

        // Start fetching TTS for all sections
        console.log('Starting TTS playback for sections:', this.queue.length);
        this.queue.forEach((section, index) => {
            section.audioPromise = this.fetchTTS(section, index);
        });

        this.play();
    }

    private async play() {
        console.log('Sections to play: ', this.queue.length);
        this.isPlaying = true;
        this.onStart?.();
        for (let i = 0; i < this.queue.length; i++) {
            console.log('Chunk playing:', i);
            // TODO: audio loading could fail
            this.onSectionStart?.(i, this.queue[i].text);
            const audioBlob = await this.queue[i].audioPromise;
            await this.playAudioBlob(audioBlob);
            console.log('Chunk played:', i);
            this.onSectionEnd?.(i, this.queue[i].text);
        }
        this.isPlaying = false;
        this.onEnd?.();
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

    private async fetchTTS(section: TTSSection, index: number): Promise<Blob> {
        const sectionHeading = this.extractSectionHeading(section.text, index);
        if (section.audioLoaded) {
            console.log('Audio already loaded for section: ', sectionHeading);
            return section.audioPromise;
        }

        if (section.audioLoading) {
            console.log('Audio already loading for section: ', sectionHeading);
            return section.audioPromise;
        }

        section.audioLoaded = false;
        section.audioLoading = true;
        try {
            if (this.getFromCache(section, sectionHeading)) {
                return section.audioPromise;
            }

            console.log('Requesting TTS for section:', sectionHeading);
            const response = await fetch('/api/tts', {
                method: 'POST',
                signal: this.abortController.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: section.text, apiKey: this.apiKey })
            });
            if (!response.ok) {
                throw new Error(`TTS request failed: ${response.status} ${response.statusText}`);
            }

            section.audioPromise = response.blob();
            await section.audioPromise;

            section.audioLoaded = true;
            console.log('TTS fetched for section:', sectionHeading);
            this.storeToCache(section, sectionHeading);
        } catch (error) {
            console.error('Error prefetching TTS:', sectionHeading, 'Error: ', error);
            section.audioLoaded = false;
            this.onError?.('Error prefetching TTS: ' + sectionHeading + '\r\nError: ' + error);

            // TODO: What to do if TTS fetching fails? Skip section or stop playback?
        } finally {
            section.audioLoading = false;
        }

        return section.audioPromise;
    }

    // TODO: For debugging purposes to reduce OpenAI token usage, remove in production
    private async storeToCache(section: TTSSection, sectionHeading: string) {
        console.log('Storing TTS in cache for section:', sectionHeading);
        try {
            // Use reader to convert blob to base64
            const blob = await section.audioPromise;
            const reader = new FileReader();
            reader.onload = (event) => {
                localStorage.setItem('blob_' + section.text, event.target.result);
            };
            reader.readAsDataURL(blob);
            console.log('Stored TTS in cache for section:', sectionHeading);
        } catch (error) {
            console.error(
                'Failed to store TTS in cache for section:',
                sectionHeading,
                'Error:',
                error
            );

            this.onError?.(
                'Failed to store TTS in cache for section: ' +
                    sectionHeading +
                    '\r\nError: ' +
                    error
            );
        }
    }

    // TODO: For debugging purposes to reduce OpenAI token usage, remove in production
    private getFromCache(section: TTSSection, sectionHeading: string): boolean {
        console.log('Checking cache for section:', sectionHeading);
        const base64 = localStorage.getItem('blob_' + section.text);
        if (!base64) {
            return false;
        }
        console.log('Using cached TTS for section:', sectionHeading);

        // Convert base64 to Blob
        // TODO: Refactor and clarify this code
        var byteString = atob(base64.split(',')[1]);
        var mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
        var arrayBuffer = new ArrayBuffer(byteString.length);
        var _ia = new Uint8Array(arrayBuffer);
        for (var i = 0; i < byteString.length; i++) {
            _ia[i] = byteString.charCodeAt(i);
        }
        var dataView = new DataView(arrayBuffer);
        section.audioPromise = Promise.resolve(new Blob([dataView], { type: mimeString }));

        section.audioLoaded = true;
        console.log('TTS fetched for section:', sectionHeading);
        return true;
    }

    public stop() {
        if (!this.isPlaying) {
            return;
        }
        this.abortController.abort();
        this.audio.pause();
        this.isPlaying = false;
        this.onStop?.();
    }

    private extractSectionHeading(section: string, index: number): string {
        // TODO: This is a temp workaround until we have structured sections from the parser
        return `${index}_${section.substring(0, section.indexOf('!!')).trim()}`;
    }
}
