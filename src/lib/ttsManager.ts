export interface TTSSection {
  text: string;
  audioBlob: Blob;
  audioLoaded: boolean;
  audioLoading: boolean;
  audioPromise: Promise<Blob> | null;
}

export class TTSSectionPlayer {
  private queue: TTSSection[];
  private isPlaying;
  private abortController: AbortController;
  private audio = new Audio();

  constructor(sections: String[]) {
    this.queue = sections.map(section => 
        {
            return {text: section,
                    audioBlob: new Blob(), 
                    audioLoaded: false,
                    audioLoading: false,
                    audioPromise: null
                } as TTSSection;}
        );
    this.isPlaying = false;
    this.abortController = new AbortController();
  }

  async start() {
    if (this.queue.length === 0) {
        return;
    };

    this.isPlaying = true;
    this.play();
  }

  private async play() {
    console.log("Sections to play: ", this.queue.length);

    for (let i = 0; i < this.queue.length; i++) {
        console.log("Chunk playing:", i);

        if(!this.queue[i].audioLoaded) {
            this.prefetchTTS(this.queue[i]);
            await this.queue[i].audioPromise; 
            // TODO: audio loading could fail
        }

        let playing = this.playAudioBlob(this.queue[i].audioBlob);

        // Preload next section
        if (i+1 < this.queue.length) {
            this.prefetchTTS(this.queue[i+1]);
        }

        await playing;
        console.log("Chunk played:", i);
    }

    this.isPlaying = false;
  }

  private playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
        if(!this.audio.paused) {
            console.log("Stopping current audio playback");
            this.audio.pause();
        }
        this.audio.src = URL.createObjectURL(blob);
        this.audio.onended = () => resolve();
        this.audio.onerror = () => reject(new Error("Audio playback failed"));
        this.audio.play().catch(reject); // Catch play() errors (e.g., autoplay policy)
    });
  }

  private async fetchTTS(text: String): Promise<Blob> {
    console.log('Requesting TTS for section:', text);

    const response = await fetch('/api/tts', {
      method: 'POST',
      signal: this.abortController.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });

    if (!response.ok || !response.body) {
      alert('TTS request failed');
      // Throw error or handle it appropriately
    }

    const stream = response.body;
    if (!stream) {
      throw new Error('TTS response body is null');
    }
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      console.log('Got chunk');
      const { done, value } = await reader.read();
      if (done) {
        break
      };
      chunks.push(value);
    }

    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    return blob;
  }

  private async prefetchTTS(section: TTSSection): Promise<void> {
    // TODO: Future caching goes here
    if(section.audioLoaded) {
        console.log("Audio already loaded for section: ", section.text);
        return;
    }

    if(section.audioLoading && section.audioPromise) {
        console.log("Audio already loading for section: ", section.text);
        return;
    }

    section.audioLoaded = false;
    section.audioLoading = true;
    section.audioPromise = this.fetchTTS(section.text);
    section.audioPromise.then((blob) => {
        section.audioBlob = blob;
        section.audioLoading = false;
        section.audioLoaded = true;
        
    }).catch((error) => {
        console.error("Error prefetching TTS for section:", section.text, error);
        section.audioLoading = false;
        section.audioLoaded = false;
    });
  }

  stop() {
    this.abortController.abort();
    this.audio.pause();
    this.isPlaying = false;
  }
}
