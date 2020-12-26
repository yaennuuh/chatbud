import * as _ from 'lodash';
import { IEvent } from '../events/IEvent';
import { IEventType } from '../events/IEventType';
import { IPlugin } from '../plugins/IPlugin';
import { IBus } from './IBus';

export abstract class AbstractBus implements IBus {
    subscribers: Map<string, IPlugin[]> = new Map();

    subscribe(plugin: IPlugin, eventTypes: IEventType[]): void {
        _.each(eventTypes, (eventType: IEventType) => {
            if (!this.subscribers.has(eventType.toKey())) {
                this.subscribers.set(eventType.toKey(), []);
            }

            const pluginList: IPlugin[] = this.subscribers.get(eventType.toKey());
            if (!_.includes(pluginList, plugin)) {
                pluginList.push(plugin);
            }
        });
    }

    notify(event: IEvent): void {
        if (event && this.subscribers.has(event.type.toKey())) {
            _.each(this.subscribers.get(event.type.toKey()), (plugin: IPlugin) => {
                if (typeof plugin.execute === "function") {
                    plugin.execute(event);
                }
            });
        }
    }
}