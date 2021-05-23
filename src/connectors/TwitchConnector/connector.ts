import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import { ElectronAuthProvider } from 'twitch-electron-auth-provider';
import { ApiClient } from 'twitch';
import { PubSubClient } from 'twitch-pubsub-client';
import { ChatClient } from 'twitch-chat-client';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client';
import * as _ from 'lodash';
import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
import { ConnectorHelper } from "../../core/connectors/ConnectorHelper";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";

class TwitchConnector implements IConnector {
    coreBot: CoreBot = CoreBot.getInstance();
    authProvider: ElectronAuthProvider;
    listenerList: any = [];
    apiClient: ApiClient;
    pubSubClient: PubSubClient;
    chatClient: ChatClient;
    userId: string;
    connectorHelper: ConnectorHelper;
    connected: boolean = false;
    scopes: string[] = ['bits:read', 'channel:read:redemptions', 'channel:read:subscriptions', 'chat:edit', 'chat:read'];

    async start(): Promise<void> {
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
        let data = this.connectorHelper.loadData();
        if (data.hasOwnProperty('autoConnect') && data['autoConnect']) {
            await this.connect();
        }
    }

    isConnected = (): boolean => {
        return this.connected;
    }

    getOwnChannel = async (): Promise<any> => {
        return this.apiClient.kraken.channels.getMyChannel();
    }

    getChannelPointsRewards = async (): Promise<string[]> => {
        return ["punkte 1", "punkte 2", "punkte 3"];
    }

    async connect() {
        this.authProvider = new ElectronAuthProvider({
            clientId: 'yfbmeopj35p9rkz0aiq3mugvqt24iu',
            redirectUri: 'http://localhost/callback'
        });
        await this.authProvider.getAccessToken(this.scopes);
        let authProvider = this.authProvider;
        this.apiClient = new ApiClient({ authProvider });
        await this.initializeListeners();
        this.connected = true;
    }

    disconnect = (): void => {
        this.stop();
        this.pubSubClient = undefined;
        this.apiClient = undefined;
        this.authProvider = undefined;
        this.connected = false;
    }

    initializeListeners = async(): Promise<void> => {
        await this.initializePubSub();
        await this.listenToChannelRedeem();
        await this.initializeChatListener();
    }

    initializeChatListener = async (): Promise<void> => {
        this.chatClient = new ChatClient(this.authProvider, {
            channels: ['barrexgaming']
        });
        await this.chatClient.connect();
        this.chatClient.onMessage(this.twitchEventHandlerMessage);
        this.chatClient.onChatClear((channel) => {
            console.log('cleared', channel);
        });
        /*
        this.chatClient.onSub((channel, user, subInfo, msg) => {});
        this.chatClient.onBitsBadgeUpgrade((channel, user, upgradeInfo, msg) => {});
        this.chatClient.onCommunityPayForward((channel, user, forwardInfo, msg) => {});
        this.chatClient.onCommunitySub((channel, user, subInfo, msg) => {});
        this.chatClient.onEmoteOnly((channel, enabled) => {});
        this.chatClient.onFollowersOnly((channel, enabled, delay) => {});
        this.chatClient.onGiftPaidUpgrade((channel, user, subInfo, msg) => {});
        this.chatClient.onHosted((channel, byChannel, auto, viewers) => {});
        this.chatClient.onPrimeCommunityGift((channel, user, subInfo, msg) => {});
        this.chatClient.onPrimePaidUpgrade((channel, user, subInfo, msg) => {});
        this.chatClient.onR9k((channel, enabled) => {});
        this.chatClient.onRaid((channel, user, raidInfo, msg) => {});
        this.chatClient.onResub((channel, user, subInfo, msg) => {});
        this.chatClient.onRewardGift((channel, user, rewardGiftInfo, msg) => {});
        this.chatClient.onRitual((channel, user, ritualInfo, msg) => {});
        this.chatClient.onSlow((channel, enabled, delay) => {});
        this.chatClient.onStandardPayForward((channel, user, forwardInfo, msg) => {});
        this.chatClient.onSub((channel, user, subInfo, msg) => {});
        this.chatClient.onSubExtend((channel, user, subInfo, msg) => {});
        this.chatClient.onSubGift((channel, user, subInfo, msg) => {});
        this.chatClient.onSubsOnly((channel, enabled) => {});
        this.chatClient.onTimeout((channel, user, duration) => {});
        */
    }

    initializePubSub = async (): Promise<void> => {
        this.pubSubClient = new PubSubClient();
        this.userId = await this.pubSubClient.registerUserListener(this.apiClient);
    }

    twitchEventHandlerMessage = (channel, user, message, msg: TwitchPrivateMessage): void => {
        //if (msg.userInfo.isBroadcaster) return;
        const eventData = new EventData(message, msg);
        
        eventData.displayName = msg.userInfo.displayName;
        eventData.username = msg.userInfo.userName;
        eventData.userId = msg.userInfo.userId;
        eventData.emotes = msg.parseEmotes();
        eventData.broadcaster = msg.userInfo.isBroadcaster;
        eventData.mod = eventData.broadcaster || msg.userInfo.isMod;
        eventData.subscriber = eventData.broadcaster || msg.userInfo.isSubscriber;
        eventData.founder = eventData.broadcaster || msg.userInfo.isFounder;
        eventData.vip = eventData.broadcaster || msg.userInfo.isVip;

        CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-chat-message', eventData));
    }

    async listenToChannelRedeem() {
        const listener = await this.pubSubClient.onRedemption(this.userId, (message: PubSubRedemptionMessage) => {
            
            const eventData = new EventData(message.message);
            eventData.userId = message.userId;
            eventData.displayName = message.userDisplayName;
            eventData.twitchChannelReedem = message;

            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-channel-reedem', eventData));
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