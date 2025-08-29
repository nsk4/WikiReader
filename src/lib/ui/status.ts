// TODO: Some better name for this enum?
export enum StatusLevel {
    OK = 'ok',
    WARN = 'warn',
    ERR = 'err',
    LOADING = 'loading',
    PLAYING = 'playing'
}

export type Status = { level: StatusLevel; message: string };
