import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import { interval } from 'rxjs';
import { EventData } from "../../core/events/EventData";
import { Event } from "../../core/events/Event";

class TwitchConnector implements IConnector {
    coreBot: CoreBot = CoreBot.getInstance();
    source = interval(5000);

    start(): void {
       // this.source.subscribe(val => this.coreBot.notifyPluginsOnEventBusIn(new Event('twitch-chat-message', new EventData('hallo neue nachricht von mir =)'))));
    }

    register(): string[] {
        return [];
    }

    execute(event: IEvent): void {
        // handle event
        throw new Error("Method not implemented.");
    }
}

module.exports = TwitchConnector;