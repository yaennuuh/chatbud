import { IEvent } from "./events/IEvent";
import { INotifiable } from "./INotifiable";
import { IPlugin } from "./plugins/IPlugin";

export interface ICoreBot {
    registerPluginToEventBusIn(plugin: IPlugin, eventTypeList: string[]): void;
    notifyPluginsOnEventBusIn(event: IEvent): void;
    registerNotifiableToEventBusOut(notifiable: INotifiable, eventTypeList: string[]): void;
    notifyNotifiableOnEventBusOut(event: IEvent, originalEvent: IEvent): Promise<void>;
    unregisterAllFromEventBusIn(): void;
    unregisterAllFromEventBusOut(): void;
}