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

    sendMessageAsStreamer = (message: string): void => {
        this.pluginHelper.sendEventToBusOut({
            type: 'twitch-send-chat-message-as-streamer',
            data: {
                message: message
            }
        });
    }

    sendMessageAsBot = (message: string): void => {
        this.pluginHelper.sendEventToBusOut({
            type: 'twitch-send-chat-message',
            data: {
                message: message
            }
        });
    }
}

module.exports = UserManagementPlugin;