import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import { ElectronAuthProvider } from 'twitch-electron-auth-provider';
import { ApiClient, Channel, HelixChannel, HelixCustomReward, HelixStream, HelixUser, PrivilegedChannel, PrivilegedUser, User } from 'twitch';
import { PubSubBitsMessage, PubSubClient, PubSubSubscriptionMessage } from 'twitch-pubsub-client';
import { ChatBitsBadgeUpgradeInfo, ChatClient, ChatCommunitySubInfo, ChatRaidInfo, ChatSubExtendInfo, ChatSubGiftInfo, ChatSubGiftUpgradeInfo, ChatSubInfo, ChatSubUpgradeInfo, ChatUser, UserNotice } from 'twitch-chat-client';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client';
import * as _ from 'lodash';
import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
import { ConnectorHelper } from "../../core/connectors/ConnectorHelper";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { EventDataTwitch } from "../../core/events/EventDataTwitch";
import { ChatPrimeCommunityGiftInfo } from "twitch-chat-client/lib/UserNotices/ChatPrimeCommunityGiftInfo";

class TwitchConnector implements IConnector {
    coreBot: CoreBot = CoreBot.getInstance();
    authProvider: ElectronAuthProvider;
    listenerList: any = [];
    twitchListeners: any = [];
    apiClient: ApiClient;
    pubSubClient: PubSubClient;
    chatClient: ChatClient;
    userId: string;
    connectorHelper: ConnectorHelper;
    connected: boolean = false;
    scopes: string[] = [
        'bits:read',
        'channel:read:redemptions',
        'channel:manage:redemptions',
        'channel:read:subscriptions',
        'chat:edit',
        'chat:read'
    ];
    data;
    channelName;

    async start(): Promise<void> {
        await this.startFunction();
    }

    register(connectorHelper: ConnectorHelper): string[] {
        this.connectorHelper = connectorHelper;
        return ['twitch-send-chat-message'];
    }

    execute(event: IEvent): void {
        if (this.chatClient && this.channelName) {
            this.chatClient.say(this.channelName, event.message);
        }
    }

    async startFunction() {
        this.data = this.connectorHelper.loadData();
        if (this.data && this.data.hasOwnProperty('autoConnect') && this.data['autoConnect']) {
            await this.connect();
        }
    }

    isConnected = (): boolean => {
        return this.connected;
    }

    getOwnChannel = async (): Promise<PrivilegedChannel> => {
        return this.apiClient.kraken.channels.getMyChannel();
    }

    createClip = async () => {
        this.apiClient.helix.clips.createClip({ channelId: this.userId });
    }

    isChannelLive = async (): Promise<boolean> => {
        let stream: HelixStream = await this.apiClient.helix.streams.getStreamByUserId(this.userId);
        return !!stream;
    }

    createClipForUserByName = async (username: string) => {
        let user: User = await this.apiClient.kraken.users.getUserByName(username);
        let userChannel: Channel = await user.getChannel();
        this.apiClient.helix.clips.createClip({ channelId: userChannel.id });
    }

    getChannelPointsRewards = async (): Promise<string[]> => {
        return this.getUser().then(async (user: HelixUser) => {
            let customRewards: HelixCustomReward[] = await this.apiClient.helix.channelPoints.getCustomRewards(user);
            return _.map(customRewards, (reward) => { return reward.title });
        });
    }

    getChannel = async (): Promise<HelixChannel> => {
        return await this.apiClient.helix.channels.getChannelInfo(await this.getUser());
    }

    getUser = async (): Promise<HelixUser> => {
        return await this.apiClient.helix.users.getUserById(this.userId);
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
        this.channelName = (await this.getUser()).name;
        this.connected = true;
    }

    disconnect = (): void => {
        this.stop();
        this.unbind();
        this.authProvider.setAccessToken(null);
        this.pubSubClient = undefined;
        this.apiClient = undefined;
        this.authProvider = undefined;
        this.connected = false;
    }

    initializeListeners = async (): Promise<void> => {
        await this.initializePubSub();
        await this.listenToChannelRedeem();
        await this.listenToBitsCheer();
        await this.listenToSubscription();
        await this.initializeChatListener();
    }

    initializeChatListener = async (): Promise<void> => {
        const channel = (await this.getUser()).name;
        this.chatClient = new ChatClient(this.authProvider, {
            channels: [channel]
        });
        await this.chatClient.connect();

        // messages
        const onMessage = this.chatClient.onMessage(this.twitchEventHandlerMessage);
        this.twitchListeners.push(onMessage);

        // chat clear
        const onChatClear = this.chatClient.onChatClear((channel) => {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-chat-cleared', null));
        });
        this.twitchListeners.push(onChatClear);

        const onEmoteOnly = this.chatClient.onEmoteOnly((channel, enabled) => {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event(enabled ? 'twitch-chat-emote-only-start' : 'twitch-chat-emote-only-stop', null));
        });
        this.twitchListeners.push(onEmoteOnly);

        const onSubsOnly = this.chatClient.onSubsOnly((channel, enabled) => {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event(enabled ? 'twitch-chat-sub-only-start' : 'twitch-chat-sub-only-stop', null));
        });
        this.twitchListeners.push(onSubsOnly);

        const onFollowersOnly = this.chatClient.onFollowersOnly((channel, enabled, duration) => {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event(enabled ? 'twitch-chat-followers-only-start' : 'twitch-chat-followers-only-stop', null));
        });
        this.twitchListeners.push(onFollowersOnly);

        const onSlow = this.chatClient.onSlow((channel, enabled, duration) => {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event(enabled ? 'twitch-chat-slow-start' : 'twitch-chat-slow-stop', null));
        });
        this.twitchListeners.push(onSlow);

        this.chatClient.onRaid((channel: string, user: string, raidInfo: ChatRaidInfo, msg: UserNotice) => {
            const eventDataTwitch = this._mapChatUserToEventDataTwitch(msg.userInfo, new EventDataTwitch(msg.message.value));
            eventDataTwitch.emotes = msg.parseEmotes();
            eventDataTwitch.raidInfo = raidInfo;
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-raid', new EventData({
                twitch: eventDataTwitch
            })));
        });
        this.chatClient.onHosted((channel: string, byChannel: string, auto: boolean, viewers?: number) => {
            const eventDataTwitch = new EventDataTwitch('');
            eventDataTwitch.hostByChannel = byChannel;
            eventDataTwitch.autoHost = auto;
            eventDataTwitch.hostViewers = viewers;
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-hosted', new EventData({
                twitch: eventDataTwitch
            })));
        });
        this.chatClient.onTimeout((channel: string, user: string, duration: number) => {
            const eventDataTwitch = new EventDataTwitch('');
            eventDataTwitch.timeoutedUser = user;
            eventDataTwitch.timeoutDuration = duration;
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-timeout', new EventData({
                twitch: eventDataTwitch
            })));
        });
        this.chatClient.onBan((channel: string, user: string) => {
            const eventDataTwitch = new EventDataTwitch('');
            eventDataTwitch.bannedUser = user;
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-ban', new EventData({
                twitch: eventDataTwitch
            })));
        });
        this.chatClient.onBitsBadgeUpgrade((channel: string, user: string, upgradeInfo: ChatBitsBadgeUpgradeInfo, msg: UserNotice) => {
            const eventDataTwitch = this._mapChatUserToEventDataTwitch(msg.userInfo, new EventDataTwitch(msg.message.value));
            eventDataTwitch.emotes = msg.parseEmotes();
            eventDataTwitch.bitsBadeUpgradeInfo = upgradeInfo;
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-bits-badge-upgrade', new EventData({
                twitch: eventDataTwitch
            })));
        });
    }

    initializePubSub = async (): Promise<void> => {
        this.pubSubClient = new PubSubClient();
        this.userId = await this.pubSubClient.registerUserListener(this.apiClient);
    }

    twitchEventHandlerMessage = (channel, user, message, msg: TwitchPrivateMessage): void => {
        //if (msg.userInfo.isBroadcaster) return;
        const eventDataTwitch = this._mapChatUserToEventDataTwitch(msg.userInfo, new EventDataTwitch(message, msg));
        eventDataTwitch.emotes = msg.parseEmotes();
        CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-chat-message', new EventData({ twitch: eventDataTwitch })));
    }

    async listenToChannelRedeem() {
        const listener = await this.pubSubClient.onRedemption(this.userId, (message: PubSubRedemptionMessage) => {

            const eventDataTwitch = new EventDataTwitch(message.message);
            eventDataTwitch.userId = message.userId;
            eventDataTwitch.displayName = message.userDisplayName;
            eventDataTwitch.twitchChannelReedem = message;

            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-channel-reedem', new EventData({ twitch: eventDataTwitch })));
        });
        this.listenerList.push(listener);
        console.log('channel redeem ready');
    }
    async listenToBitsCheer() {
        const listener = await this.pubSubClient.onBits(this.userId, (message: PubSubBitsMessage) => {

            const eventDataTwitch = new EventDataTwitch(message.message);
            eventDataTwitch.userId = message.userId;
            eventDataTwitch.displayName = message.userName;
            eventDataTwitch.bitsCheer = message;

            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-bits-cheer', new EventData({ twitch: eventDataTwitch })));
        });
        this.listenerList.push(listener);
        console.log('channel bits ready');
    }

    async listenToSubscription() {
        const listener = await this.pubSubClient.onSubscription(this.userId, (message: PubSubSubscriptionMessage) => {

            const eventDataTwitch = new EventDataTwitch(message.message?.message);
            eventDataTwitch.userId = message.userId;
            eventDataTwitch.displayName = message.userDisplayName;
            eventDataTwitch.subscription = message;

            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-subscription', new EventData({ twitch: eventDataTwitch })));
        });
        this.listenerList.push(listener);
        console.log('channel subs ready');
    }

    stop(): void {
        _.each(this.listenerList, (listener) => {
            listener.remove();
        });
    }

    unbind(): void {
        _.each(this.twitchListeners, (listener) => {
            listener.unbind();
        });
    }

    _mapChatUserToEventDataTwitch = (chatUser: ChatUser, eventDataTwitch: EventDataTwitch): EventDataTwitch => {
        eventDataTwitch.displayName = chatUser.displayName;
        eventDataTwitch.username = chatUser.userName;
        eventDataTwitch.userId = chatUser.userId;
        eventDataTwitch.userType = chatUser.userType;
        eventDataTwitch.badges = chatUser.badges;
        eventDataTwitch.badgeInfo = chatUser.badgeInfo;
        eventDataTwitch.broadcaster = chatUser.isBroadcaster;
        eventDataTwitch.mod = eventDataTwitch.broadcaster || chatUser.isMod;
        eventDataTwitch.subscriber = eventDataTwitch.broadcaster || chatUser.isSubscriber;
        eventDataTwitch.founder = eventDataTwitch.broadcaster || chatUser.isFounder;
        eventDataTwitch.vip = eventDataTwitch.broadcaster || chatUser.isVip;
        return eventDataTwitch;
    }
}

module.exports = TwitchConnector;