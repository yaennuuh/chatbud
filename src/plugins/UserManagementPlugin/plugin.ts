class UserManagementPlugin {
    pluginHelper: any;
    commands: any[];

    register = (pluginHelper: any): string[] => {
        this.pluginHelper = pluginHelper;
        return ['twitch-chat-message'];
    }

    execute = (event: any): void => {
        this.pluginHelper.getUserManagementHelper().addTwitchUser(event.data.userId, event.data.username);
    }
}

module.exports = UserManagementPlugin;