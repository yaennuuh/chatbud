import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import { EventData } from "../../core/events/EventData";
import { Event } from "../../core/events/Event";
import * as tmi from 'tmi.js';
import { ConnectorHelper } from "../../core/connectors/ConnectorHelper";

class TwitchBotConnector implements IConnector {
    connectorHelper: ConnectorHelper;
    opts;
    client;
    data;
    connected = false;

    start = (): void => {
        this.data = this.connectorHelper.loadData();
        if (this.data.hasOwnProperty('autoConnect') && this.data['autoConnect']) {
            this.connectToTwitch();
        }
    }

    register = (connectorHelper: ConnectorHelper): string[] => {
        this.connectorHelper = connectorHelper;
        return ['twitch-send-chat-message'];
        // return [];
    }

    execute = (event: IEvent): void => {
        if (this.client) {
            this.client.say(this.opts.channels[0], event.data.message);
        }
    }

    connectToTwitch = (): void => {
        this.configureClient();
        this.connectClient();
    }

    isConnected = (): boolean => {
        return this.connected;
    }

    configureClient = (): void => {
        // Define configuration options
        this.opts = {
            identity: {
                username: this.data['username'],
                password: this.data['authkey']
            },
            channels: [
                this.data['channel']
            ]
        };
        this.client = new tmi.client(this.opts);
    }

    connectClient = (): void => {
        // this.client.on('message', this.onMessageHandler);
        this.client.on('connected', this.onConnectedHandler);
        this.client.connect();
        this.connected = true;
    }

    disconnect = (): void => {
        this.client.disconnect();
        this.connected = false;
    }

    /* onMessageHandler = (channel, context, message, self): void => {
        if (self) { return; } // Ignore messages from the bot

        // Remove whitespace from chat message
        message = message.trim();
        let event: IEvent = this.connectorHelper.getEmptyEvent();
        event.data.message = message;

        event.data.displayName = context['display-name'];
        event.data.username = context['username'];
        event.data.userId = context['user-id'];
        event.data.emotes = context['emotes'];

        if (context['message-type'] === 'chat') {
            event.data.color = context['color'];
            event.data.mod = context['mod'];
            event.data.subscriber = context['subscriber'];
            event.data.turbo = context['turbo'];

            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-chat-message', event.data));
        } else {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-whisper-message', event.data));
        }

    } */

    onConnectedHandler = (addr, port): void => {
        console.log(`* Connected to ${addr}:${port}`);
    }
}

module.exports = TwitchBotConnector;