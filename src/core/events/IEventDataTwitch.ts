import { ChatBitsBadgeUpgradeInfo, ChatRaidInfo } from "@twurple/chat";
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { PubSubBitsMessage, PubSubRedemptionMessage, PubSubSubscriptionMessage } from "@twurple/pubsub";


export interface IEventDataTwitch {
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

    raidInfo?: ChatRaidInfo
    hostByChannel?: string;
    autoHost?: boolean;
    hostViewers?: number;
    timeoutedUser?: string;
    timeoutDuration?: number;
    bannedUser?: string;
    bitsBadeUpgradeInfo?: ChatBitsBadgeUpgradeInfo;
    
    twitchChannelReedem?: PubSubRedemptionMessage;
    bitsCheer?: PubSubBitsMessage;
    subscription?: PubSubSubscriptionMessage;
}