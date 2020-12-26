interface IBus {
    subscribers: Map<IEventType, IPlugin[]>;
    subscribe(plugin: IPlugin, eventTypes: IEventType[]): void;
    notify(event: IEvent): void;
}