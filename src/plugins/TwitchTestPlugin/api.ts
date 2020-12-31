class TwitchTestPluginApi {

    private plugin: any;

    constructor(plugin) {
        this.plugin = plugin;
    }

    sendMessageToChatAsBot(message: string) {
        this.plugin.sendMessageToChatAsBot(message);
    }
}

module.exports = TwitchTestPluginApi;