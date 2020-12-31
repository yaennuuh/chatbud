class TwitchBotConnectorApi {

    private connector: any;

    constructor(connector) {
        this.connector = connector;
    }

    connect = (): void => {
        this.connector.connectToTwitch();
    }

    disconnect = (): void => {
        this.connector.disconnect();
    }

    isConnected = (): boolean => {
        return this.connector.isConnected();
    }
}

module.exports = TwitchBotConnectorApi;