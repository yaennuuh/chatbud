import { type } from "os";
import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
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

    execute = (event: IEvent): void => {
        if (event.data.emotes) {
            for (const [key, value] of Object.entries(event.data.emotes)) {
                let indexes = value[0].split('-');
                console.log(`gefundenes emote: ${event.data.message.substring(indexes[0], (parseInt(indexes[1])+1))}`);
            }
        }
        const splittedMessage = event.data.message.split(' ');
        const data = this.pluginHelper.loadData();
        data.commands.forEach(command => {
            if (command['enabled'] && command['command'] === splittedMessage[0]) {
                let commandResponse = (' ' + command['response']).slice(1);
                for (let index = 1; index < splittedMessage.length; index++) {
                    const element = splittedMessage[index];
                    if (commandResponse.indexOf(`$${index}`) != -1) {
                        commandResponse = commandResponse.replace(`$${index}`, element);
                    }
                }
                this.pluginHelper.sendEventToBusOut(new Event('twitch-send-chat-message', new EventData(commandResponse)));
            }
        });
    }
}

module.exports = CommandsPlugin;