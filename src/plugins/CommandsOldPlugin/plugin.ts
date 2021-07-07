import { IEvent } from "../../core/events/IEvent";

class CommandsOldPlugin {
    pluginHelper: any;
    commands: any[];

    register = (pluginHelper: any): string[] => {
        this.pluginHelper = pluginHelper;
        return [];
        /* return ['twitch-chat-message']; */
    }

    execute = (event: any): void => {
        // Emote finder
        // if (event.data.emotes) {
        //     for (const [key, value] of Object.entries(event.data.emotes)) {
        //         let indexes = value[0].split('-');
        //         console.log(`gefundenes emote: ${event.data.message.substring(indexes[0], (parseInt(indexes[1]) + 1))}`);
        //     }
        // }
        const splittedMessage = event.data.message.split(' ');
        const data = this.pluginHelper.loadData();
        data.commands.forEach(async command => {
            if (command['enabled'] && command['command'] === splittedMessage[0]) {
                const cooldownHelper = this.pluginHelper.getCooldownHelper();

                let hasGlobalCooldownSet = +command['global-cooldown'] != 0;
                let hasGlobalCooldown = hasGlobalCooldownSet ? await cooldownHelper.hasCooldownForGlobal(command['command']) : false;

                let hasUserCooldownSet = +command['user-cooldown'] != 0;
                let hasUserCooldown = hasUserCooldownSet ? await cooldownHelper.hasCooldownForUser(command['command'], event.data.userId) : false;

                if (!hasUserCooldown && !hasGlobalCooldown) {

                    let commandResponse = (' ' + command['response']).slice(1);
                    for (let index = 1; index < splittedMessage.length; index++) {
                        const element = splittedMessage[index];
                        if (commandResponse.indexOf(`$${index}`) != -1) {
                            commandResponse = commandResponse.replace(`$${index}`, element);
                        }
                    }

                    if (hasGlobalCooldownSet) {
                        await cooldownHelper.setCooldownForGlobal(command['command'], command['global-cooldown']);
                    }
                    if (hasUserCooldownSet) {
                        await cooldownHelper.setCooldownForUser(command['command'], event.data.userId, command['user-cooldown'], );
                    }

                    this.sendMessageToTwitch(commandResponse, null);

                } else {
                    if (hasUserCooldown) {
                        let remainingCooldownTime = await cooldownHelper.getCooldownForUser(command['command'], event.data.userId);
                        this.sendMessageToTwitch(`USER - Der command ${command['command']} ist noch für ${remainingCooldownTime} Sekunden im cooldown!`, null);
                    } else if (hasGlobalCooldown) {
                        let remainingCooldownTime = await cooldownHelper.getCooldownForGlobal(command['command']);
                        this.sendMessageToTwitch(`GLOBAL - Der command ${command['command']} ist noch für ${remainingCooldownTime} Sekunden im cooldown!`, null);
                    }
                }
            }
        });
    }

    sendMessageToTwitch = (message: string, originalEvent: IEvent): void => {
        this.pluginHelper.sendEventToBusOut({
            type: 'twitch-send-chat-message',
            data: {
                message: message
            }
        });
    }
}

module.exports = CommandsOldPlugin;