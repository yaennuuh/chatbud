import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";
import { PluginHelper } from "../../core/plugins/PluginHelper";

class LoggerPlugin implements IPlugin {
    pluginHelper: PluginHelper;
    data: any;

    register(pluginHelper: PluginHelper) {
        this.pluginHelper = pluginHelper;
        return ['*'];
    }

    execute(event: IEvent) {
        let log = this.pluginHelper.getLogger("LoggerPlugin");
        log.info(`new event on eventBusIn {type: ${event.type}, data: ${JSON.stringify(event.data)}}`);
    }
}

module.exports = LoggerPlugin;
