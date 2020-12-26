import { IEvent } from "../events/IEvent";
import { IEventType } from "../events/IEventType";
import { IPlugin } from "../plugins/IPlugin";

export interface IBus {
    subscribers: Map<string, IPlugin[]>;
    subscribe(plugin: IPlugin, eventTypes: IEventType[]): void;
    notify(event: IEvent): void;
}