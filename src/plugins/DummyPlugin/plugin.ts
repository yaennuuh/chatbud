import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";
var PluginHelper = require("../../core/plugins/PluginHelper");

class TwitchTestPlugin implements IPlugin {
    DATA_FILE_PATH: string = __dirname + '\\data.yaml';
    pluginHelper: typeof PluginHelper;
    data: any;

    register(pluginHelper: typeof PluginHelper) {
        this.pluginHelper = pluginHelper;
        return ['twitch-chat-message'];
    }

    execute(event: IEvent) {
    }
}

module.exports = TwitchTestPlugin;