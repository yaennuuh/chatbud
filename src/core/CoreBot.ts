import { EventInBus } from "./busses/EventInBus";
import { EventOutBus } from "./busses/EventOutBus";
import { IEvent } from "./events/IEvent";
import { ICoreBot } from "./ICoreBot";
import { INotifiable } from "./INotifiable";
import { IPlugin } from "./plugins/IPlugin";

export class CoreBot implements ICoreBot {
    private static instance: CoreBot;
    private eventBusIn: EventInBus;
    private eventBusOut: EventOutBus;

    private constructor() {
        this.eventBusIn = new EventInBus();
        this.eventBusOut = new EventOutBus();
    }

    static getInstance(): CoreBot {
        if (this.instance == null) {
            this.instance = new CoreBot();
        }
        return this.instance;
    }

    /***
     * EVENT BUS IN
     */

    registerPluginToEventBusIn(plugin: IPlugin, eventTypeList: string[]): void {
        this.eventBusIn.subscribe(plugin, eventTypeList);
    }

    notifyPluginsOnEventBusIn(event: IEvent): void {
        this.eventBusIn.notify(event);
    }

    /***
     * EVENT BUS OUT
     */

    registerNotifiableToEventBusOut(notifiable: INotifiable, eventTypeList: string[]): void {
        this.eventBusOut.subscribe(notifiable, eventTypeList);
    }

    notifyNotifiableOnEventBusOut(event: IEvent): void {
        // Intercept with filter
        this.eventBusOut.notify(event);
    }
}