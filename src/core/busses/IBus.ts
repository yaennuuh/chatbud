import { IEvent } from "../events/IEvent";
import { IEventType } from "../events/IEventType";

export interface IBus<T> {
    subscribers: Map<string, T[]>;
    subscribe(plugin: T, eventTypes: IEventType[]): void;
    notify(event: IEvent): void;
}