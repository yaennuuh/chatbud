import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
import { IEvent } from "../../core/events/IEvent";

class DummyConnector implements IConnector {

    start(): void {
        setTimeout(function () {
            CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('dummy-chat-message', new EventData('test')));
        }, 5000);
    }

    register(): string[] {
        return ['dummy-chat-message'];
    }

    execute(event: IEvent): void {
        console.log(event);
    }
}

module.exports = DummyConnector;
