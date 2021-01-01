import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";
import { PluginHelper } from "../../core/plugins/PluginHelper";

class CommandsPlugin implements IPlugin {
    pluginHelper: PluginHelper;
    commands: any[];

    register = (pluginHelper: PluginHelper): string[] => {
        this.pluginHelper = pluginHelper;
        return ['twitch-chat-message'];
    }

    execute(event: IEvent) {
    }
}

module.exports = CommandsPlugin;