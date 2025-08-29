<script lang="ts">
    import { StatusLevel, type Status } from '$lib/ui/status';
    export let status: Status = { level: StatusLevel.OK, message: 'Ready.' };
</script>

<div class="statusbar" aria-live="polite">
    <div class="statusbar-inner">
        <div
            class="dot {status.level === StatusLevel.WARN ? StatusLevel.WARN : ''} {status.level ===
            StatusLevel.ERR
                ? StatusLevel.ERR
                : ''} {status.level === StatusLevel.PLAYING
                ? StatusLevel.PLAYING
                : ''} {status.level === StatusLevel.LOADING ? StatusLevel.LOADING : ''}"
        ></div>
        <div style="font-size:13px">{status.message}</div>
    </div>
</div>
