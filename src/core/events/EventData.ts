import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { IEventData } from "./IEventData";

export class EventData implements IEventData {
    message: string;
    displayName?: string;
    username?: string;
    userId?: string;
    emotes?: any;
    color?: string;
    mod?: boolean;
    subscriber?: boolean;
    turbo?: boolean;
    twitchMessage?: TwitchPrivateMessage

    constructor(message: string, twitchMessage?: TwitchPrivateMessage) {
        this.message = message;
        this.twitchMessage = twitchMessage;
    }

}