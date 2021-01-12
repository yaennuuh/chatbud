import { ITwitchUser } from "./ITwitchUser";

export class TwitchUser implements ITwitchUser {
    private twitchId: string;
    private twitchUsername: string;

    constructor(twitchId: string, twitchUsername: string) {
        this.twitchId = twitchId;
        this.twitchUsername = twitchUsername;
    }

    getUserId = (): string => {
        return this.twitchId;
    };

    getUsername = (): string => {
        return this.twitchUsername;
    };
}