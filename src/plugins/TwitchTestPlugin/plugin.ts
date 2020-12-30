import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";
var PluginHelper = require("../../core/plugins/PluginHelper");

class TwitchTestPlugin implements IPlugin {
    DATA_FILE_PATH: string = __dirname + '\\data.yaml';
    pluginHelper: typeof PluginHelper;
    data: any;

    register(pluginHelper: typeof PluginHelper) {
        this.pluginHelper = pluginHelper;
        console.log('here', this.pluginHelper.loadData());
        return ['twitch-chat-message'];
    }

    execute(event: IEvent) {
    }

    //this.pluginHelper.sendEventToBusOut(new Event('twitch-send-chat-message', new EventData(message)));
    
    // this.data = this.pluginHelper.loadData(this.DATA_FILE_PATH);
    // this.pluginHelper.saveData(this.DATA_FILE_PATH, this.data);
}

module.exports = TwitchTestPlugin;