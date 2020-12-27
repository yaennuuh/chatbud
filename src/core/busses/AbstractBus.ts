import * as _ from 'lodash';
import { IEvent } from '../events/IEvent';
import { INotifiable } from '../INotifiable';
import { IBus } from './IBus';

export abstract class AbstractBus<T extends INotifiable> implements IBus<T> {
    subscribers: Map<string, T[]> = new Map();

    subscribe(notifiable: T, eventTypes: string[]): void {
        _.each(eventTypes, (eventType: string) => {
            if (!this.subscribers.has(eventType)) {
                this.subscribers.set(eventType, []);
            }

            const notifiableList: T[] = this.subscribers.get(eventType);
            if (!_.includes(notifiableList, notifiable)) {
                notifiableList.push(notifiable);
            }
        });
    }

    notify(event: IEvent): void {
        if (event && this.subscribers.has(event.type)) {
            _.each(this.subscribers.get(event.type), (notifiable: T) => {
                if (typeof notifiable.execute === "function") {
                    notifiable.execute(event);
                }
            });
        }
    }
}