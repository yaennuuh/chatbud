import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import * as _ from 'lodash';
import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
import { ConnectorHelper } from "../../core/connectors/ConnectorHelper";
import { EventDataTwitch } from "../../core/events/EventDataTwitch";
import { ElectronAuthProvider } from "@twurple/auth-electron";
import { ApiClient, HelixChannel, HelixClip, HelixClipCreateParams, HelixCustomReward, HelixStream, HelixUser } from "@twurple/api";
import { PubSubBitsMessage, PubSubClient, PubSubRedemptionMessage, PubSubSubscriptionMessage } from "@twurple/pubsub";
import { ChatBitsBadgeUpgradeInfo, ChatClient, ChatCommunitySubInfo, ChatRaidInfo, ChatUser, UserNotice } from "@twurple/chat";
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { async } from "rxjs";

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
        'channel:read:subscriptions',
        'channel:manage:redemptions',
        'channel_subscriptions',
        'channel:moderate',
        'chat:edit',
        'chat:read',
        'whispers:edit',
        'whispers:read'
    ];
    data;
    channelName;
    subGiftCounts = new Map<string | undefined, number>();

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

    getOwnChannel = async (): Promise<HelixChannel> => {
        return this.apiClient.channels.getChannelInfo(this.userId);
    }

    getTotalFollows = async (userId: string): Promise<number> => {
        let follows = await this.apiClient.users.getFollows({
            followedUser: userId,
            limit: 1,
        });
        return follows.total;
    }

    getSubscriptions = async (userId: string): Promise<any> => {
        const subs = await this.apiClient.subscriptions.getSubscriptionsPaginated(userId).getAll();
        const tier1SubCount = subs.reduce((result, sub) => result + (sub.tier === '1000' ? 1 : 0), 0);
        const tier2SubCount = subs.reduce((result, sub) => result + (sub.tier === '2000' ? 1 : 0), 0);
        const tier3SubCount = subs.reduce((result, sub) => result + (sub.tier === '3000' ? 1 : 0), 0);
        const totalSubCount = subs.length;
        return {
            tier1: tier1SubCount,
            tier2: tier2SubCount,
            tier3: tier3SubCount,
            totalSubCount
        };
    }

    isChannelLive = async (): Promise<boolean> => {
        return !!await this.getOwnStream();
    }

    getOwnStream = async (): Promise<HelixStream> => {
        return this.apiClient.streams.getStreamByUserId(this.userId);
    }

    getStreamByUsername = async (username: string): Promise<HelixStream> => {
        return this.apiClient.streams.getStreamByUserName(username);
    }

    createClip = async (): Promise<void> => {
        let helixClipCreateParams: HelixClipCreateParams = {
            channelId: (await this.getOwnChannel()).id
        };
        this.apiClient.clips.createClip(helixClipCreateParams);
    }

    getClipForUser = async(userId: string): Promise<any> => {
        const clips = await this.apiClient.clips.getClipsForBroadcasterPaginated(userId).getAll();
        return {
            numberOfClips: clips.length,
            mostViewedClip: clips.reduce((prev, current) => (prev.views > current.views) ? prev : current),
            totalClipViews: clips.map(clip => clip.views).reduce((partial_sum, a) => partial_sum + a, 0),
            latestClip: clips[clips.length-1]
        };
    }

    getChannelPointsRewards = async (): Promise<HelixCustomReward[]> => {
        return this.apiClient.channelPoints.getCustomRewards(this.userId);
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
        // CORRECT? this.authProvider.setAccessToken(null);
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
        this.chatClient = new ChatClient({
            authProvider: this.authProvider,
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
        this.chatClient.onCommunitySub((channel: string, user: string, subInfo: ChatCommunitySubInfo, msg: UserNotice) => {
            const eventDataTwitch = this._mapChatUserToEventDataTwitch(msg.userInfo, new EventDataTwitch(msg.message.value));
            eventDataTwitch.emotes = msg.parseEmotes();
            const previousGiftCount = this.subGiftCounts.get(msg.userInfo.userId) ?? 0;
            this.subGiftCounts.set(msg.userInfo.userId, previousGiftCount + subInfo.count);
            subInfo.count += previousGiftCount;
            eventDataTwitch.communitySubGiftInfo = subInfo;
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-community-sub-gift', new EventData({
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
        this.userId = await this.pubSubClient.registerUserListener(this.authProvider);
    }

    twitchEventHandlerMessage = (channel, user, message, msg: TwitchPrivateMessage): void => {
        //if (msg.userInfo.isBroadcaster) return;
        const eventDataTwitch = this._mapChatUserToEventDataTwitch(msg.userInfo, new EventDataTwitch(message, msg));
        eventDataTwitch.emotes = msg.parseEmotes();
        CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-chat-message', new EventData({ twitch: eventDataTwitch })));
    }

    async listenToChannelRedeem(): Promise<void> {
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
    async listenToBitsCheer(): Promise<void> {
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

    async listenToSubscription(): Promise<void> {
        const listener = await this.pubSubClient.onSubscription(this.userId, (message: PubSubSubscriptionMessage) => {
            const previousGiftCount = this.subGiftCounts.get(message.gifterId) ?? 0;
            if (previousGiftCount > 0) {
                this.subGiftCounts.set(message.gifterId, previousGiftCount - 1);
            } else {
                const eventDataTwitch = new EventDataTwitch(message.message?.message);
                eventDataTwitch.userId = message.gifterId;
                eventDataTwitch.displayName = message.gifterDisplayName;
                eventDataTwitch.subscription = message;

                CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-subscription', new EventData({ twitch: eventDataTwitch })));
            }
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