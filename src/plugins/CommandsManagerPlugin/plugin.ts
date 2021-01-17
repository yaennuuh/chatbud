import { IEvent } from "../../core/events/IEvent";
import { PluginHelper } from "../../core/plugins/PluginHelper";

class CommandsManagerPlugin {
    pluginHelper: PluginHelper;

    register = (pluginHelper: PluginHelper): string[] => {
        this.pluginHelper = pluginHelper;
        return ['twitch-chat-message'];
    }

    execute = (event: IEvent): void => {
    }
}

module.exports = CommandsManagerPlugin;