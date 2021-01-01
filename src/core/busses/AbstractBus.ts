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
        if (event && _.size(this.subscribers) > 0) {
            _.each(this.subscribersToNotify(event.type), (subscriber: string) => {
                _.each(this.subscribers.get(subscriber), (notifiable: T) => {
                    if (typeof notifiable.execute === "function") {
                        notifiable.execute(event);
                    }
                });
            });
        }
    }

    subscribersToNotify(eventType: string): string[]{
        return _.filter(Array.from(this.subscribers.keys()), function (item){
            if(item.indexOf("*") > 0){
                return _.startsWith(eventType, item.substr(0, item.indexOf("*")));
            }
            return _.isEqual('*', item) || _.isEqual(eventType, item) ;
        });
    }
}