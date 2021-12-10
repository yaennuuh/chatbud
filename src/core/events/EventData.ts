import { IEventData } from "./IEventData";
import { IEventDataTwitch } from "./IEventDataTwitch";

export class EventData implements IEventData {
    twitch: IEventDataTwitch;

    constructor(data: any) {
        this.twitch = data?.twitch;
    }

}