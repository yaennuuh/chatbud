import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import { ElectronAuthProvider } from 'twitch-electron-auth-provider';
import { ApiClient } from 'twitch';
import { BasicPubSubClient, PubSubClient } from 'twitch-pubsub-client';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client';
import * as _ from 'lodash';
import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
import { ConnectorHelper } from "../../core/connectors/ConnectorHelper";

class TwitchConnector implements IConnector {
    coreBot: CoreBot = CoreBot.getInstance();
    authProvider: ElectronAuthProvider;
    listenerList: any = [];
    apiClient: ApiClient;
    pubSubClient: PubSubClient;
    userId: string;
    connectorHelper: ConnectorHelper;

    async start(): Promise<void> {
        this.authProvider = new ElectronAuthProvider({
            clientId: 'yfbmeopj35p9rkz0aiq3mugvqt24iu',
            redirectUri: 'http://localhost/callback'
        });
        await this.startFunction();
    }

    register(connectorHelper: ConnectorHelper): string[] {
        this.connectorHelper = connectorHelper;
        return [];
    }

    execute(event: IEvent): void {
        // handle event
        throw new Error("Method not implemented.");
    }

    async startFunction() {
        await this.login();
        await this.initializePubSub();
        await this.listenToChannelRedeem();
    }

    async login() {
        await this.authProvider.getAccessToken(['bits:read', 'channel:read:redemptions']);
    }

    async initializePubSub(): Promise<void> {
        let authProvider = this.authProvider;
        this.apiClient = new ApiClient({ authProvider });
        this.pubSubClient = new PubSubClient();
        this.userId = await this.pubSubClient.registerUserListener(this.apiClient);
    }

    async listenToChannelRedeem() {
        const listener = await this.pubSubClient.onRedemption(this.userId, (message: PubSubRedemptionMessage) => {
            console.log(message.rewardName);
            this.sendEventToTwitchAsBot(`Thank you for purchasing ${message.rewardName}`);
        });
        this.listenerList.push(listener);
        console.log('channel redeem ready');
    }

    sendEventToTwitchAsBot(message: string) {
        CoreBot.getInstance().notifyNotifiableOnEventBusOut(new Event('twitch-send-chat-message', new EventData(message)));
    }

    stop(): void {
        _.each(this.listenerList, (listener) => {
            listener.remove();
        });
    }
}

module.exports = TwitchConnector;