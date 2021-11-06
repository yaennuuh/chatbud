import { IEvent } from "../events/IEvent";

export interface IBus<T> {
    subscribers: Map<string, T[]>;
    subscribe(plugin: T, eventTypes: string[]): void;
    notify(event: IEvent): void;
    unsubscribeAll(): void;
}