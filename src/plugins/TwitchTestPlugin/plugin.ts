import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";
import { PluginHelper } from "../../core/plugins/PluginHelper";

class TwitchTestPlugin implements IPlugin {
    DATA_FILE_PATH: string = __dirname + '\\data.yaml';
    pluginHelper: PluginHelper;
    data: any;

    register(pluginHelper: PluginHelper) {
        this.pluginHelper = pluginHelper;
        return ['twitch-chat-message'];
    }

    execute(event: IEvent) {
        console.log(event.data.message);
    }

    sendMessageToChatAsBot(message: string) {
        this.pluginHelper.sendEventToBusOut(new Event('twitch-send-chat-message', new EventData(message)));
    }

    //this.pluginHelper.sendEventToBusOut(new Event('twitch-send-chat-message', new EventData(message)));

    // this.data = this.pluginHelper.loadData(this.DATA_FILE_PATH);
    // this.pluginHelper.saveData(this.DATA_FILE_PATH, this.data);
}

module.exports = TwitchTestPlugin;