import { IConnector } from "../../core/connectors/IConnector";
import { CoreBot } from "../../core/CoreBot";
import { IEvent } from "../../core/events/IEvent";
import { Event } from "../../core/events/Event";
import {EventData} from "../../core/events/EventData";

class DummyConnector implements IConnector {

    start(): void {
        let eventData = new EventData("[#loop 2] something[#loop 2] nix[/#loop][/#loop][#if $username == $username]dfsdfsfds[#else]asd[/#if] matching wait [#wait 5] not matching [/#wait] [#wait 2] matching wait [/#wait] sdfdsf[#if user == zwei] zweites if [#else] zweites else [/#if]");
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
