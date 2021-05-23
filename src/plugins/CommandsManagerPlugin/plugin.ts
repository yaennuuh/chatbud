import _ from "lodash";
import { IEvent } from "../../core/events/IEvent";
import { PluginHelper } from "../../core/plugins/PluginHelper";
import { CommandManagementHelper } from "../../core/utils/CommandManagementHelper";
import { CommandType } from "../../core/utils/entities/CommandTypeEnum";
import { ICommand } from "../../core/utils/entities/ICommand";
import { ICommandAction } from "../../core/utils/entities/ICommandAction";
import { ICommandCondition } from "../../core/utils/entities/ICommandCondition";

class CommandsManagerPlugin {
    pluginHelper: PluginHelper;
    commandManagerHelper: CommandManagementHelper;

    register = (pluginHelper: PluginHelper): string[] => {
        this.pluginHelper = pluginHelper;
        this.commandManagerHelper = pluginHelper.getCommandManagementHelper();
        return ['twitch-chat-message', 'twitch-channel-reedem'];
    }

    execute = (event: IEvent): void => {
        if (event.type === 'twitch-chat-message') {
            console.log('twitch nachricht erkannt');
            this._executeCommand(event);
        } else if (event.type === 'twitch-channel-reedem') {
            console.log('twitch punkte erkannt');
            this._executeChannelPoints(event);
        }
    }

    private _executeCommand = (event: IEvent): void => {
        const eventMessage = event.data.message.trim();
        const eventCommand = eventMessage.split(' ');
        const searchCommandString = eventCommand.shift();
        this._findCommand(searchCommandString, "COMMAND").then((command: ICommand) => {
            console.log('gefunden command ', command);
            if (command) {
                const conditions = command.getConditions();
                let conditionsSucceed = true;
                _.each(conditions, (condition: ICommandCondition) => {
                    if (conditionsSucceed) {
                        const pluginApi = this.pluginHelper.pluginApiByName(condition.getPluginId());
                        const commandField = condition.getFieldId() ? command.getFields().find((field) => field.getId() === condition.getFieldId()) : undefined;
                        conditionsSucceed = pluginApi[condition.getFunctionName()](event, eventCommand, commandField);
                    }
                });

                if (conditionsSucceed) {
                    const actions = command.getActions();
                    _.each(actions, (action: ICommandAction) => {
                        const pluginApi = this.pluginHelper.pluginApiByName(action.getPluginId());
                        const commandField = action.getFieldId() ? command.getFields().find((field) => field.getId() === action.getFieldId()) : undefined;
                        pluginApi[action.getFunctionName()](event, eventCommand, commandField);
                    });
                }
            }
        });
    }

    private _executeChannelPoints = (event: IEvent): void => {
        const eventMessage = event.data.twitchChannelReedem.message ? event.data.twitchChannelReedem.message.trim() : '';
        const eventCommand = eventMessage.split(' ');
        this._findCommand(event.data.twitchChannelReedem.rewardName, "CHANNEL_POINT").then((command: ICommand) => {
            if (command) {
                const actions = command.getActions();
                _.each(actions, (action: ICommandAction) => {
                    const pluginApi = this.pluginHelper.pluginApiByName(action.getPluginId());
                    const commandField = command.getFields() ? command.getFields().find((field) => field.getId() === action.getFieldId()) : undefined;
                    pluginApi[action.getFunctionName()](event, eventCommand, commandField);
                });
            }
        });
    }

    private _findCommand = async (command: string, commandType: string): Promise<ICommand> => {
        return this.commandManagerHelper.getCommandByNameAndType(command, commandType);
    }
}

module.exports = CommandsManagerPlugin;