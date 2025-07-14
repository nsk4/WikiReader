<script lang="ts">
    import { onMount } from "svelte";


  let ttsType = 'default';
  let wikiUrl = '';
  let wikiText = '';
  let status = '';

  let isSpeakJsLoaded = false;

  onMount(() => {
    loadSpeakJS();
  });

  async function readWithOpenAi(text: string) {
    const res = await fetch('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      alert('TTS request failed');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    new Audio(url).play();
  }

  function loadSpeakJS() {
    if (isSpeakJsLoaded)
     {
        return;
     }

    const speakJsElement = document.createElement("script");
    speakJsElement.src = "/speakjs/speakClient.js";
    speakJsElement.onload = () => {
      isSpeakJsLoaded = true;
      console.log("Speak.js loaded");
    };
    document.body.appendChild(speakJsElement);
  }

  async function readWithSpeakJs(text: string) {
    console.log(typeof window.speak === 'function')
    console.log(window.speak);
    if (!window.speak) {
      alert("Speak.js not loaded yet");
      return;
    }
    window.speak(text, { amplitude: 100, pitch: 50, speed: 175 });
  }
  
  function readWithBrowserTTS(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  


  async function fetchArticleText(title: string): Promise<string> {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=extracts&explaintext=true&format=json&titles=${encodeURIComponent(title)}`
    );
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    return page.extract || '';
  }

  async function handleUrlRead() {
    status = '';
    const match = url.match(/\/wiki\/(.+)$/);
    const title = match ? decodeURIComponent(match[1]) : null;
    if (!title) {
      status = '⚠️ Invalid Wikipedia URL';
      return;
    }

    const text = await fetchArticleText(title);
    if (!text) {
      status = '❌ Article not found or empty';
      return;
    }

    await readText(text);    
  }

  async function readText(text: string) {
    switch (ttsType) {
      case 'speakjs':
        await readWithSpeakJs(text);
        break;
      case 'openai':
        await readWithOpenAi(text);
        break;
      default:
        await readWithBrowserTTS(text);
    }
    status = '🔊 Reading started...';
  }
</script>


<h1>WikiReader</h1>
<select bind:value={ttsType}>
  <option value="default" selected>Browser</option>
  <option value="speakjs">Speak.js</option>
  <option value="openai">Open AI</option>
</select>

<br />

<input bind:value={wikiUrl} placeholder="Paste Wikipedia URL" />
<button on:click={handleUrlRead}>Read Article</button>

<br />

<textarea bind:value={wikiText} placeholder="Paste Text"></textarea>
<button on:click={() => readText(wikiText)}>Read Text</button>
<p>{status}</p>

<br />

<button on:click={() => {
  const ac = new AudioContext()
  const o = ac.createOscillator();
  o.connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + 0.25);
}}>Test sound</button>
<div id="audio"></div>