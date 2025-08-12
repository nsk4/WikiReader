import { OPENAI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    console.log('Received TTS request');
    const { text, voice = 'coral', instructions = '' } = await request.json();
    console.log('Text:', text);

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini-tts',
            voice,
            instructions,
            input: text,
            response_format: 'mp3',
            stream: true
        })
    });

    console.log('TTS response status:', res.status);

    if (!res.ok) {
        return json({ error: 'TTS failed' }, { status: 500 });
    }

    return new Response(res.body, {
        headers: {
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-store'
        }
    });
}
