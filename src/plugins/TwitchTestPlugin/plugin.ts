import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";

class TwitchTestPlugin implements IPlugin {

    register() {
        return ['twitch-chat-message'];
    }

    execute(event: IEvent) {
        console.log('twitch plugin:', event.data.message);
    }
}

module.exports = TwitchTestPlugin;