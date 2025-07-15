# WikiReader

**WikiReader** is a lightweight web app that turns Wikipedia articles into spoken audio using either offline browser based `speechSynthesis` or OpenAI's `gpt-4o-mini-tts`. It fetches and parses articles via the official Wikipedia REST API and reads them aloud in near real-time. Users can either input custom text or select an article by title.

## How it works
- Paste a Wikipedia article URL and click Fetch Article
- The app fetches the main article text via the Wikipedia public API
- Decide on the browser's built-in Text-to-Speech or OpenAI's TTS model and click Read Text
- Browser's build-in support is local and free, for OpenAI you have to add your OpenAI API key to the env variable

## 🚧 Note
This project is built with SvelteKit and TypeScript and is under active development. Expect bugs and unpolished UX! 

Current plans include a text-to-speech pipeline, Wikipedia article fetching and parsing, audio caching, usage tracking, login with basic/full tiers, and production-ready deployment.