import { ChattersList, HelixSubscription } from "@twurple/api/lib";
import { ChatBitsBadgeUpgradeInfo, ChatCommunitySubInfo, ChatRaidInfo } from "@twurple/chat";
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { PubSubBitsMessage, PubSubRedemptionMessage, PubSubSubscriptionMessage } from "@twurple/pubsub";
import { IEventDataTwitch } from "./IEventDataTwitch";

export class EventDataTwitch implements IEventDataTwitch {
    message: string;
    displayName?: string;
    username?: string;
    userId?: string;
    badges?: Map<string, string>;
    badgeInfo?: Map<string, string>;
    userType?: string | undefined;
    emotes?: any;
    color?: string;
    mod?: boolean;
    subscriber?: boolean;
    broadcaster?: boolean;s
    founder?: boolean;
    vip?: boolean;
    turbo?: boolean;
    twitchMessage?: TwitchPrivateMessage;

    raidInfo?: ChatRaidInfo;
    hostByChannel?: string;
    autoHost?: boolean;
    hostViewers?: number;
    timeoutedUser?: string;
    timeoutDuration?: number;
    bannedUser?: string;
    bitsBadeUpgradeInfo?: ChatBitsBadgeUpgradeInfo;
    communitySubGiftInfo?: ChatCommunitySubInfo;
    
    twitchChannelReedem?: PubSubRedemptionMessage;
    bitsCheer?: PubSubBitsMessage;
    subscription?: PubSubSubscriptionMessage;

    chattersList?: ChattersList;
    subscribersList?: any[];
    subscriptionTier?: string;
    isChannelLive?: boolean;

    constructor(message: string, twitchMessage?: TwitchPrivateMessage) {
        this.message = message;
        this.twitchMessage = twitchMessage;
    }

}