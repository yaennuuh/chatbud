import { INotifiable } from "../INotifiable";
import { ConnectorHelper } from "./ConnectorHelper";

export interface IConnector extends INotifiable {
    start(): void;
    register(connectorHelper: ConnectorHelper): string[];
}