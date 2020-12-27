import { IConnector } from "../connectors/IConnector";
import { INotifiable } from "../INotifiable";
import { AbstractBus } from "./AbstractBus";

export class EventOutBus extends AbstractBus<INotifiable> {

}