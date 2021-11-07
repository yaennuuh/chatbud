import { ConnectorHelper } from "../../core/connectors/ConnectorHelper";
import { IConnector } from "../../core/connectors/IConnector";
import { IEvent } from "../../core/events/IEvent";

class DummyConnector implements IConnector {
    connectorHelper: ConnectorHelper;

    start(): void {
        // setTimeout(function () {
        //     CoreBot.getInstance().notifyPluginsOnEventBusIn(new Event('dummy-chat-message', new EventData('test')));
        // }, 5000);
    }

    register(connectorHelper: ConnectorHelper): string[] {
        this.connectorHelper = connectorHelper;
        return ['dummy-chat-message'];
    }

    execute(event: IEvent): void {
    }
}

module.exports = DummyConnector;
