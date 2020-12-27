import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { EventTypeEnum } from "../../core/events/EventTypeEnum";
import { IEvent } from "../../core/events/IEvent";

class TwitchConnector implements IConnector {
    coreBot: CoreBot = CoreBot.getInstance();

    start(): void {
        throw new Error("Method not implemented.");
    }

    register(eventTypes: EventTypeEnum): EventTypeEnum[] {
        console.log('hi');
        throw new Error("Method not implemented.");
    }

    execute(event: IEvent): void {
        // handle event
        throw new Error("Method not implemented.");
    }
}

module.exports = TwitchConnector;