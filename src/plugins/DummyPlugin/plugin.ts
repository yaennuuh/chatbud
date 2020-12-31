import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";
import { PluginHelper } from "../../core/plugins/PluginHelper";

class DummyPlugin implements IPlugin {
    DATA_FILE_PATH: string = __dirname + '\\data.yaml';
    pluginHelper: PluginHelper;
    data: any;

    register(pluginHelper: PluginHelper) {
        this.pluginHelper = pluginHelper;
        return ['twitch-chat-message'];
    }

    execute(event: IEvent) {
    }

    getDummy(): string {
        return 'dummy';
    }
}

module.exports = DummyPlugin;