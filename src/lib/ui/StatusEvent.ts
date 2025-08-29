import type { StatusLevel } from './status';

export class StatusEvent extends CustomEvent<{ level: StatusLevel; message: string }> {
    constructor(level: StatusLevel, message: string) {
        super('wikireader-status', { detail: { level, message } });
    }
}
