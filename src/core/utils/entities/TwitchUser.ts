import { first } from "lodash";
import { ITwitchUser } from "./ITwitchUser";

export class TwitchUser implements ITwitchUser {
    private twitchId: string;
    private twitchUsername: string;
    private firstSeen: Date;
    private lastSeen: Date;

    constructor(twitchId: string, twitchUsername: string, firstSeen?: Date, lastSeen?: Date) {
        this.twitchId = twitchId;
        this.twitchUsername = twitchUsername;
        this.firstSeen = firstSeen;
        this.lastSeen = lastSeen ? lastSeen : firstSeen;
    }

    getUserId = (): string => {
        return this.twitchId;
    };

    getUsername = (): string => {
        return this.twitchUsername;
    };

    getFirstSeen = (): Date => {
        return this.firstSeen;
    };

    setFirstSeen = (firstSeen: Date): void => {
        this.firstSeen = firstSeen;
    }

    getLastSeen = (): Date => {
        return this.lastSeen;
    };

    setLastSeen = (lastSeen: Date): void => {
        this.lastSeen = lastSeen;
    }
}