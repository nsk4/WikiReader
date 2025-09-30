# WikiReader

**WikiReader** is a lightweight web app that turns Wikipedia articles into spoken audio using either
offline browser based `speechSynthesis` or OpenAI's `gpt-4o-mini-tts`. It fetches articles via the
official Wikipedia REST API, parses them and reads them aloud in near real-time.

## How it works

- Choose your playback option.
- Paste a Wikipedia article URL and click Fetch Article.
- The app fetches the main article text via the Wikipedia public API and parses it.
- Uncheck "Read introduction only" if you want the whole article to be read.
- Browser's build-in support is local and free, for OpenAI you have to add your OpenAI API key to
  the env variable. For tightened security you can also add a passphrase if you want to share public
  deployment with only selected users.

## Getting Started

- Run `npm install` to install dependencies.
- Run `npm run dev` to start the development server.

## 🚧 Note

This project is built with SvelteKit and TypeScript and is under active development. Expect bugs!

Current plans include a text-to-speech pipeline, Wikipedia article fetching and parsing, audio
caching, usage tracking, login with basic/full tiers, and production-ready deployment.