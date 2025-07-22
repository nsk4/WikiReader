export interface TTSSection {
  text: string;
  audioBlob: Blob;
  audioLoaded: boolean;
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
                    audioLoaded: false
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
            await this.prefetchTTS(this.queue[i]);
        }
        let playing = this.playAudioBlob(this.queue[i].audioBlob);

        // Preload next section
        if (i+1 < this.queue.length) {
            // TODO: check if we need to await here
            await this.prefetchTTS(this.queue[i+1]);
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
    section.audioBlob = await this.fetchTTS(section.text);
    section.audioLoaded = true;
  }

  stop() {
    this.abortController.abort();
    this.audio.pause();
    this.isPlaying = false;
  }
}
