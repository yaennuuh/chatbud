import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import { ElectronAuthProvider } from 'twitch-electron-auth-provider';
import { ApiClient } from 'twitch';
import { PubSubClient } from 'twitch-pubsub-client';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client';
import * as _ from 'lodash';
import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";

class TwitchConnector implements IConnector {
    coreBot: CoreBot = CoreBot.getInstance();
    authProvider: ElectronAuthProvider;
    listenerList: any = [];
    apiClient: ApiClient;
    pubSubClient: PubSubClient;
    userId: string;

    async start(): Promise<void> {
        this.authProvider = new ElectronAuthProvider({
            clientId: 'yfbmeopj35p9rkz0aiq3mugvqt24iu',
            redirectUri: 'http://localhost/callback'
        });
        await this.authProvider.getAccessToken(['bits:read', 'channel:read:redemptions']);
        await this.initializePubSub();
        await this.listenToChannelRedeem();
    }

    register(): string[] {
        return [];
    }

    execute(event: IEvent): void {
        // handle event
        throw new Error("Method not implemented.");
    }

    private async initializePubSub(): Promise<void> {
        let authProvider = this.authProvider;
        this.apiClient = new ApiClient({ authProvider });
        this.pubSubClient = new PubSubClient();
        this.userId = await this.pubSubClient.registerUserListener(this.apiClient);
    }

    private async listenToChannelRedeem() {
        const listener = await this.pubSubClient.onRedemption(this.userId, (message: PubSubRedemptionMessage) => {
            console.log(message.rewardName);
            this.sendEventToTwitchAsBot(`Thank you for purchasing ${message.rewardName}`);
        });
        this.listenerList.push(listener);
        console.log('channel redeem ready');
    }

    private sendEventToTwitchAsBot(message: string) {
        CoreBot.getInstance().notifyNotifiableOnEventBusOut(new Event('twitch-send-chat-message', new EventData(message)));
    }

    stop(): void {
        _.each(this.listenerList, (listener) => {
            listener.remove();
        });
    }
}

module.exports = TwitchConnector;