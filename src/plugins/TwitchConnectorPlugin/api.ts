import { IEvent } from "../../core/events/IEvent";

class TwitchConnectorPluginApi {
    
    constructor(private plugin: any) {
    }

    createClip = (): void => {
        this.plugin.createClip();
    }

    isChannelLive = (event: IEvent, command: string, eventCommand: any, commandField: any): boolean => {
        return this.plugin.isChannelLive().then((isLive: boolean) => { return isLive; });
    }
}

module.exports = TwitchConnectorPluginApi;