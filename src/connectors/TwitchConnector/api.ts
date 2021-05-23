import { async } from "rxjs";

class TwitchConnectorApi {

    private connector: any;

    constructor(connector) {
        this.connector = connector;
    }

    connect = async(): Promise<void> => {
        await this.connector.connect();
    }

    disconnect = (): void => {
        this.connector.disconnect();
    }

    isConnected = (): boolean => {
        return this.connector.isConnected();
    }

    getMyChannel = async(): Promise<any> => {
        return this.connector.getOwnChannel();
    }

    getChannelPointsRewards = async(): Promise<string[]> => {
        return await this.connector.getChannelPointsRewards();
    }

    createClip = () => {
        this.connector.createClip();
    }
    
    createClipForUserByName = () => {
        this.connector.createClipForUserByName();
    }

    isChannelLive = async(): Promise<boolean> => {
        return await this.connector.isChannelLive();
    }
}

module.exports = TwitchConnectorApi;