import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { PubSubRedemptionMessage } from "twitch-pubsub-client/lib";
import { IEventDataTwitch } from "./IEventDataTwitch";

export class EventDataTwitch implements IEventDataTwitch {
    message: string;
    displayName?: string;
    username?: string;
    userId?: string;
    emotes?: any;
    color?: string;
    mod?: boolean;
    subscriber?: boolean;
    broadcaster?: boolean;
    founder?: boolean;
    vip?: boolean;
    turbo?: boolean;
    twitchMessage?: TwitchPrivateMessage;
    twitchChannelReedem?: PubSubRedemptionMessage;

    constructor(message: string, twitchMessage?: TwitchPrivateMessage) {
        this.message = message;
        this.twitchMessage = twitchMessage;
    }

}