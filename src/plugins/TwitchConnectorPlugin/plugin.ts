class TwitchConnectorPlugin {
    pluginHelper: any;
    commands: any[];

    register = (pluginHelper: any): string[] => {
        this.pluginHelper = pluginHelper;
        return [];
    }

    createClip = () => {
        const twitchConnectorApi = this.pluginHelper.getConnectorApiByName('TwitchConnector');
        twitchConnectorApi.createClip();
    }

    isChannelLive = async (): Promise<boolean> => {
        const twitchConnectorApi = this.pluginHelper.getConnectorApiByName('TwitchConnector');
        return await twitchConnectorApi.isChannelLive();
    }
}

module.exports = TwitchConnectorPlugin;