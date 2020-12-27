import * as _ from 'lodash';
import { IEvent } from '../events/IEvent';
import { IEventType } from '../events/IEventType';
import { INotifiable } from '../INotifiable';
import { IBus } from './IBus';

export abstract class AbstractBus<T extends INotifiable> implements IBus<T> {
    subscribers: Map<string, T[]> = new Map();

    subscribe(notifiable: T, eventTypes: IEventType[]): void {
        _.each(eventTypes, (eventType: IEventType) => {
            if (!this.subscribers.has(eventType.toKey())) {
                this.subscribers.set(eventType.toKey(), []);
            }

            const notifiableList: T[] = this.subscribers.get(eventType.toKey());
            if (!_.includes(notifiableList, notifiable)) {
                notifiableList.push(notifiable);
            }
        });
    }

    notify(event: IEvent): void {
        if (event && this.subscribers.has(event.type.toKey())) {
            _.each(this.subscribers.get(event.type.toKey()), (notifiable: T) => {
                if (typeof notifiable.execute === "function") {
                    notifiable.execute(event);
                }
            });
        }
    }
}