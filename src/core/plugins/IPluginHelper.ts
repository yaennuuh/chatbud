import { IEvent } from "../events/IEvent";

export interface IPluginHelper {
    sendEventToBusOut(event: IEvent): void;
}