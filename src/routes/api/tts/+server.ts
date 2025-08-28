import { OPENAI_API_KEY } from '$env/static/private';
import { ACCESS_PASSPHRASE } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request, fetch }) {
    console.log('Received TTS request');
    const { text, passphrase } = await request.json();
    console.log('Text:', text, 'Passphrase:', passphrase);

    if (passphrase !== ACCESS_PASSPHRASE) {
        console.warn('Invalid passphrase attempt');
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add caching in the future

    const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini-tts',
            voice: 'sage',
            instructions:
                'Read in a clear and confident tone with lively pacing. Use expressive intonation and gentle emphasis to highlight key ideas, making the narration feel inviting and encouraging while staying professional.',
            input: text,
            response_format: 'mp3',
            stream: true
        }),
        signal: request.signal
    });

    console.log('TTS response status:', upstream.status);

    if (!upstream.ok || !upstream.body) {
        const errText = await upstream.text().catch(() => '');
        console.error('TTS upstream error:', upstream.status, errText);
        return json({ error: 'TTS failed' }, { status: 500 });
    }

    return new Response(upstream.body, {
        headers: {
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-store'
        }
    });
}
