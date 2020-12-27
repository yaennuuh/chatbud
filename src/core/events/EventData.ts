import { IEventData } from "./IEventData";

export class EventData implements IEventData {
    message: string;
    displayName?: string;
    username?: string;
    emotes?: any;
    color?: string;
    mod?: boolean;
    subscriber?: boolean;
    turbo?: boolean;

    constructor(message: string) {
        this.message = message;
    }

}