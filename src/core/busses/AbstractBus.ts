import * as _ from "lodash";

export abstract class AbstractBus implements IBus {
    subscribers: Map<IEventType, IPlugin[]> = new Map();

    subscribe(plugin: IPlugin, eventTypes: IEventType[]): void {
        _.each(eventTypes, (eventType: IEventType) => {
            if (!this.subscribers.has(eventType)) {
                this.subscribers.set(eventType, []);
            }

            const pluginList = this.subscribers.get(eventType);
            if (!_.includes(plugin, pluginList)) {
                pluginList.push(plugin);
            }
        });
    }

    notify(event: IEvent): void {
        if (event && this.subscribers.has(event.type)) {
            _.each(this.subscribers.get(event.type), (plugin: IPlugin) => {
                if (typeof plugin.execute === "function") {
                    plugin.execute(event);
                }
            });
        }
    }
}