import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";
import { PluginHelper } from "../../core/plugins/PluginHelper";
import {Logger} from "@tsed/logger";

class LoggerPlugin implements IPlugin {
    pluginHelper: PluginHelper;
    data: any;
    logger: Logger;

    register(pluginHelper: PluginHelper, logger: Logger) {
        this.pluginHelper = pluginHelper;
        this.logger = logger;
        return ['*'];
    }

    execute(event: IEvent) {
        this.logger.info(`new event on eventBusIn {type: ${event.type}, data: ${JSON.stringify(event.data)}}`);
    }
}

module.exports = LoggerPlugin;
