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

    start(): void {
        this.data = this.connectorHelper.loadData();
        if (this.data.hasOwnProperty('autoConnect') && this.data['autoConnect']) {
            this.connectToTwitch();
        }
    }

    register(connectorHelper: ConnectorHelper): string[] {
        this.connectorHelper = connectorHelper;
        return ['twitch-send-chat-message'];
    }

    execute(event: IEvent): void {
        this.client.say(this.opts.channels[0], event.data.message);
    }

    connectToTwitch = (): void => {
        this.configureClient();
        this.connectClient();
    }

    isConnected = (): boolean => {
        return this.connected;
    }

    configureClient() {
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
        this.client.on('message', this.onMessageHandler);
        this.client.on('connected', this.onConnectedHandler);
        this.client.connect();
        this.connected = true;
    }

    disconnect = (): void => {
        this.client.disconnect();
        this.connected = false;
    }

    onMessageHandler(channel, context, message, self): void {
        if (self) { return; } // Ignore messages from the bot

        // Remove whitespace from chat message
        message = message.trim();
        const eventData = new EventData(message);

        eventData.displayName = context['display-name'],
            eventData.username = context['username'],
            eventData.emotes = context['emotes']

        if (context['message-type'] === 'chat') {
            eventData.color = context['color'];
            eventData.mod = context['mod'];
            eventData.subscriber = context['subscriber'];
            eventData.turbo = context['turbo'];

            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-chat-message', eventData));
        } else {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-whisper-message', eventData));
        }

    }

    onConnectedHandler(addr, port): void {
        console.log(`* Connected to ${addr}:${port}`);
    }
}

module.exports = TwitchBotConnector;