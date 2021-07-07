import { IEvent } from "../../core/events/IEvent";

class UserManagementPlugin {
    pluginHelper: any;
    commands: any[];

    register = (pluginHelper: any): string[] => {
        this.pluginHelper = pluginHelper;
        return ['twitch-chat-message'];
    }

    execute = (event: any): void => {
        if (event && event.data && event.data.userId && event.data.username) {
            this.pluginHelper.getUserManagementHelper().addTwitchUser(event.data.userId, event.data.username);
        }
    }

    sendMessageAsStreamer = (message: string, originalEvent: IEvent): void => {
        this.pluginHelper.sendEventToBusOut({
            type: 'twitch-send-chat-message-as-streamer',
            data: {
                message: message
            }
        }, originalEvent);
    }

    sendMessageAsBot = (message: string, originalEvent: IEvent): void => {
        this.pluginHelper.sendEventToBusOut({
            type: 'twitch-send-chat-message',
            data: {
                message: message
            }
        }, originalEvent);
    }
}

module.exports = UserManagementPlugin;