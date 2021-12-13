import { ChatBitsBadgeUpgradeInfo, ChatCommunitySubInfo, ChatRaidInfo, ChatSubExtendInfo, ChatSubGiftInfo, ChatSubGiftUpgradeInfo, ChatSubInfo, ChatSubUpgradeInfo } from "twitch-chat-client/lib";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { ChatPrimeCommunityGiftInfo } from "twitch-chat-client/lib/UserNotices/ChatPrimeCommunityGiftInfo";
import { PubSubBitsMessage, PubSubRedemptionMessage, PubSubSubscriptionMessage } from "twitch-pubsub-client/lib";
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
    
    twitchChannelReedem?: PubSubRedemptionMessage;
    bitsCheer?: PubSubBitsMessage;
    subscription?: PubSubSubscriptionMessage;

    constructor(message: string, twitchMessage?: TwitchPrivateMessage) {
        this.message = message;
        this.twitchMessage = twitchMessage;
    }

}