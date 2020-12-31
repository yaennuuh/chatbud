import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import { Event } from "../../core/events/Event";
import {EventData} from "../../core/events/EventData";

class DummyConnector implements IConnector {

    start(): void {
        let eventData = new EventData("$username");
        setTimeout(function () {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('twitch-chat-message', eventData));
        }, 5000);
    }

    register(): string[] {
        return ['twitch-chat-message'];
    }

    execute(event: IEvent): void {
        console.log(event);
    }
}

module.exports = DummyConnector;
