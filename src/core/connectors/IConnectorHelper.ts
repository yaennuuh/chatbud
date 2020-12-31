import { IEvent } from "../events/IEvent";

export interface IConnectorHelper {
    getOwnConnectorApi(): any;
    loadData(): any;
    saveData(data: any): void;
}