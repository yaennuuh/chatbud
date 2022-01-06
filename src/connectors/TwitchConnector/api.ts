import { HelixCustomReward } from "@twurple/api";
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

    getTotalFollows = async(userId: string): Promise<number> => {
        return this.connector.getTotalFollows(userId);
    }

    getSubscriptions = async(userId: string): Promise<any> => {
        return this.connector.getSubscriptions(userId);
    }

    getChannelPointsRewards = async(): Promise<HelixCustomReward[]> => {
        return await this.connector.getChannelPointsRewards();
    }

    getClipForUser = async(userId: string): Promise<any> => {
        return this.connector.getClipForUser(userId);
    }

    getAllChatters = async(channelName: string): Promise<any> => {
        return this.connector.getAllChatters(channelName);
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